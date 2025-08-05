// fiver-clone/server/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http'); // 1. Import Node's built-in http module
const { Server } = require('socket.io'); // 2. Import the Server class from socket.io
const { createClient } = require('@supabase/supabase-js');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const app = express();
const server = http.createServer(app); // 3. Create an HTTP server from the Express app

// 4. Initialize Socket.IO and attach it to the HTTP server with CORS configured
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL, // Your client's URL (e.g., http://localhost:3000)
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { gigId } = req.body;

    // 1. Fetch gig details from Supabase
    const { data: gig, error } = await supabase
      .from('gigs')
      .select('title, price')
      .eq('id', gigId)
      .single();

    if (error || !gig) return res.status(404).send({ error: 'Gig not found' });

    // 2. Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: gig.title },
          unit_amount: Math.round(gig.price * 100), // Price in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      // These URLs are where Stripe will redirect the user after payment
      success_url: `${process.env.CLIENT_URL}/success?gig_id=${gigId}`,
      cancel_url: `${process.env.CLIENT_URL}/gig/${gigId}`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).send({ error: err.message });
  }
});
// --- API Routes (No changes here) ---
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { gigId } = req.body;
    const { data: gig } = await supabase.from('gigs').select('title, price').eq('id', gigId).single();
    if (!gig) return res.status(404).send({ error: 'Gig not found' });
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: { currency: 'usd', product_data: { name: gig.title }, unit_amount: Math.round(gig.price * 100) },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success?gig_id=${gigId}`,
      cancel_url: `${process.env.CLIENT_URL}/gig/${gigId}`,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// --- Socket.IO Connection Logic ---
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('joinRoom', (orderId) => {
    socket.join(orderId);
    console.log(`User ${socket.id} joined room ${orderId}`);
  });

  socket.on('sendMessage', (data) => {
    io.to(data.orderId).emit('receiveMessage', data.message);
  });

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 8800;
// 5. Use 'server.listen' to start the server, not 'app.listen'
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));