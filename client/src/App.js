// client/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import AdminRoute from './components/AdminRoute';
import DashboardGate from './components/DashboardGate';
import HomePage from './pages/HomePage';
import CreateGig from './pages/CreateGig';
import GigDetailPage from './pages/GigDetailPage';
import EditGigPage from './pages/EditGigPage';
import OrdersPage from './pages/OrdersPage';
import ChatPage from './pages/ChatPage';
import LeaveReviewPage from './pages/LeaveReviewPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create-gig" element={<CreateGig />} />
            <Route path="/gig/:gigId" element={<GigDetailPage />} />
            <Route path="/gig/:gigId/edit" element={<EditGigPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/chat/:orderId" element={<ChatPage />} />
            <Route path="/order/:orderId/review" element={<LeaveReviewPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Dashboard and Admin routes */}
            <Route path="/dashboard" element={<DashboardGate />} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;