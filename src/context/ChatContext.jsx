import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import API from '../config';

const ChatContext = createContext();

const safeJson = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { return { message: `Server error (${res.status}): ${text.slice(0, 200)}` }; }
};

export const ChatProvider = ({ children }) => {
  const { token } = useAuth();
  const [conversations, setConversations]   = useState([]);
  const [activeConvoId, setActiveConvoId]   = useState(null);
  const [messages, setMessages]             = useState([]);
  const [loadingConvos, setLoadingConvos]   = useState(false);
  const [loadingMsgs, setLoadingMsgs]       = useState(false);

  const authH = useCallback(() =>
    token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {}
  , [token]);

  // ── Fetch all conversations for the current user ───────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!token) return;
    setLoadingConvos(true);
    try {
      const res  = await fetch(`${API}/conversations`, { headers: authH() });
      const data = await safeJson(res);
      if (res.ok) setConversations(Array.isArray(data) ? data : []);
    } finally {
      setLoadingConvos(false);
    }
  }, [token, authH]);

  // ── Open or create a conversation with another user ────────────────────────
  // Returns the conversation object
  const openOrCreateConversation = useCallback(async (otherName, listingTitle = '', itemId = null, marketType = null) => {
    if (!token) return null;
    const res  = await fetch(`${API}/conversations`, {
      method: 'POST',
      headers: authH(),
      body: JSON.stringify({ otherName, listingTitle, itemId, marketType }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.message || 'Failed to open chat');
    setActiveConvoId(data._id);
    return data;
  }, [token, authH]);

  // ── Fetch messages for active conversation ─────────────────────────────────
  const fetchMessages = useCallback(async (conversationId) => {
    if (!token || !conversationId) return;
    setLoadingMsgs(true);
    try {
      const res  = await fetch(`${API}/messages/${conversationId}`, { headers: authH() });
      const data = await safeJson(res);
      if (res.ok) setMessages(Array.isArray(data) ? data : []);
    } finally {
      setLoadingMsgs(false);
    }
  }, [token, authH]);

  // ── Send a message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (conversationId, text) => {
    if (!token) return;
    const res  = await fetch(`${API}/messages/${conversationId}`, {
      method: 'POST',
      headers: authH(),
      body: JSON.stringify({ text }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.message || 'Failed to send');
    setMessages(prev => [...prev, data]);
    // Bubble conversation to top
    setConversations(prev => {
      const idx = prev.findIndex(c => c._id === conversationId);
      if (idx < 0) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], updatedAt: new Date().toISOString() };
      return [updated[idx], ...updated.slice(0, idx), ...updated.slice(idx + 1)];
    });
    return data;
  }, [token, authH]);

  // ── Send an Offer ──────────────────────────────────────────────────────────
  const sendOffer = useCallback(async (conversationId, offerDetails) => {
    if (!token) return;
    const res = await fetch(`${API}/messages/${conversationId}/offer`, {
      method: 'POST',
      headers: authH(),
      body: JSON.stringify(offerDetails),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.message || 'Failed to send offer');
    setMessages(prev => [...prev, data]);
    return data;
  }, [token, authH]);

  // ── Respond to an Offer ────────────────────────────────────────────────────
  const respondToOffer = useCallback(async (messageId, action) => {
    if (!token) return;
    const res = await fetch(`${API}/messages/${messageId}/respond`, {
      method: 'PATCH',
      headers: authH(),
      body: JSON.stringify({ action }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.message || 'Failed to respond to offer');
    
    // Replace the offer message with the updated one
    setMessages(prev => prev.map(m => m._id === messageId ? data : m));

    // If accepted, also refresh messages to get the System message
    if (action === 'accept' || action === 'reject') {
        setTimeout(() => fetchMessages(data.conversationId), 500);
    }
    return data;
  }, [token, authH, fetchMessages]);


  return (
    <ChatContext.Provider value={{
      conversations, messages,
      activeConvoId, setActiveConvoId,
      loadingConvos, loadingMsgs,
      fetchConversations, fetchMessages,
      openOrCreateConversation, sendMessage,
      sendOffer, respondToOffer,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};
