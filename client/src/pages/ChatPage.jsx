// client/src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import io from 'socket.io-client';

const ChatPage = () => {
  const { orderId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null); // Use a ref to hold the socket instance

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchInitialData = useCallback(async (user) => {
    // Get or create conversation
    let { data: conversation } = await supabase.from('conversations').select('id').eq('order_id', orderId).single();
    if (!conversation) {
      const { data: newConversation } = await supabase.from('conversations').insert({ order_id: orderId }).select('id').single();
      conversation = newConversation;
    }
    if (!conversation) throw new Error("Could not get or create conversation.");
    setConversationId(conversation.id);
    
    // Fetch existing messages
    const { data: messagesData } = await supabase.from('messages').select('*, sender:users(username)').eq('conversation_id', conversation.id).order('created_at', { ascending: true });
    setMessages(messagesData || []);
    
    // Join the socket room after fetching data
    socketRef.current.emit('joinRoom', orderId);
  }, [orderId]);

  useEffect(() => {
    // Connect the socket when the component mounts
    socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:8800');
    
    const setup = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");
        setCurrentUser(user);
        await fetchInitialData(user);
      } catch(err) {
        console.error("Error setting up chat:", err);
      } finally {
        setLoading(false);
      }
    }
    setup();

    // Listen for incoming messages
    socketRef.current.on('receiveMessage', (incomingMessage) => {
      setMessages((prevMessages) => [...prevMessages, incomingMessage]);
    });
    
    // Cleanup function: disconnects when the user navigates away
    return () => {
      socketRef.current.disconnect();
    };
  }, [orderId, fetchInitialData]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !conversationId) return;

    try {
      // 1. Save the new message to the database
      const { data: savedMessage, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: newMessage.trim(),
        })
        .select('*, sender:users(username)')
        .single();
      
      if (error) throw error;

      // 2. Emit the message. The server will broadcast it back to everyone,
      // and the 'receiveMessage' listener above will add it to the UI.
      socketRef.current.emit('sendMessage', { orderId, message: savedMessage });
      
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (loading) return <p className="text-center p-8">Loading Chat...</p>;

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col h-[calc(100vh-10rem)]">
      <h1 className="text-2xl font-bold mb-4 border-b pb-2">Conversation for Order #{orderId.substring(0, 8)}...</h1>
      <div className="flex-grow overflow-y-auto p-4 bg-gray-50 rounded-lg">
        {messages.map(msg => (
          <div key={msg.id} className={`flex my-2 ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-3 rounded-lg ${msg.sender_id === currentUser?.id ? 'bg-skillora-green text-white' : 'bg-white shadow-md'}`}>
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs opacity-75 mt-1 block text-right">{new Date(msg.created_at).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-skillora-green"
        />
        <button type="submit" className="bg-skillora-green text-white px-6 font-bold rounded-r-lg hover:bg-green-700">Send</button>
      </form>
    </div>
  );
};

export default ChatPage;
