import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ListingProvider } from './context/ListingContext';
import { ChatProvider } from './context/ChatContext';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Marketplace } from './pages/Marketplace';
import { Chat } from './pages/Chat';
import { PricePrediction } from './pages/PricePrediction';
import { FarmerMarketplace } from './pages/FarmerMarketplace';
import { Inventory } from './pages/Inventory';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

// Farmer-only Route (buyers get redirected to marketplace)
const FarmerRoute = ({ children }) => {
  const { isAuthenticated, profile } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" />;
  if (profile?.role !== 'farmer') return <Navigate to="/marketplace" />;
  return children;
};

function AppContent() {
  return (
    <>
      <BottomNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prediction"
          element={
            <FarmerRoute>
              <PricePrediction />
            </FarmerRoute>
          }
        />
        <Route
          path="/farmer-marketplace"
          element={
            <FarmerRoute>
              <FarmerMarketplace />
            </FarmerRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <FarmerRoute>
              <Inventory />
            </FarmerRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ListingProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </ListingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
