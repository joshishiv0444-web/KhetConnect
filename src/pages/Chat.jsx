import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { Send, MoreVertical, Search, ArrowLeft, ShieldCheck, Wheat, Loader2, MessageCircle, FileSignature, CheckCircle2, XCircle } from 'lucide-react';

export const Chat = () => {
  const { profile } = useAuth();
  const {
    conversations, messages,
    activeConvoId, setActiveConvoId,
    loadingConvos, loadingMsgs,
    fetchConversations, fetchMessages,
    openOrCreateConversation, sendMessage,
    sendOffer, respondToOffer,
  } = useChat();

  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();
  const [text, setText]         = useState('');
  const [search, setSearch]     = useState('');
  const [sending, setSending]   = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerForm, setOfferForm] = useState({ price: '', quantity: '1' });
  const messagesEndRef           = useRef(null);

  // ── On mount: handle ?with= redirect OR just load conversation list ────────
  useEffect(() => {
    const withName     = searchParams.get('with');
    const listingTitle = searchParams.get('listing') || '';
    const itemId       = searchParams.get('itemId');
    const marketType   = searchParams.get('market');

    if (withName) {
      openOrCreateConversation(withName, listingTitle, itemId, marketType).then(async convo => {
        if (convo) {
          await fetchConversations();
          fetchMessages(convo._id);
          navigate('/chat', { replace: true });
        }
      });
    } else {
      fetchConversations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);   // run only once on mount

  // ── Load messages when active convo changes ────────────────────────────────
  useEffect(() => {
    if (activeConvoId) fetchMessages(activeConvoId);
  }, [activeConvoId, fetchMessages]);

  // ── Auto-scroll to bottom ──────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const activeConvo = conversations.find(c => c._id === activeConvoId) || null;

  const otherParticipant = (convo) =>
    convo?.participants?.find(p => p !== profile?.name) || '?';

  const filteredConvos = conversations.filter(c =>
    otherParticipant(c).toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConvoId || sending) return;
    setSending(true);
    try {
      await sendMessage(activeConvoId, text.trim());
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleSendOffer = async (e) => {
    e.preventDefault();
    if (!offerForm.price || !offerForm.quantity || !activeConvo || sending) return;
    if (!activeConvo.itemId || !activeConvo.marketType) {
        alert("This conversation is not linked to a specific marketplace item.");
        return;
    }
    setSending(true);
    try {
      await sendOffer(activeConvoId, {
          price: Number(offerForm.price),
          quantity: Number(offerForm.quantity),
          itemId: activeConvo.itemId,
          marketType: activeConvo.marketType,
          itemName: activeConvo.listingTitle
      });
      setShowOfferForm(false);
      setOfferForm({ price: '', quantity: '1' });
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleRespond = async (messageId, action, msgDetails = null) => {
    try {
        await respondToOffer(messageId, action);
        if (action === 'accept') {
            // Re-fetch messages so the "Deal Closed!" system message appears immediately
            if (activeConvoId) setTimeout(() => fetchMessages(activeConvoId), 800);
        }
        if (action === 'reject' && msgDetails) {
            setOfferForm({ price: String(msgDetails.price), quantity: String(msgDetails.quantity) });
            setShowOfferForm(true);
        }
    } catch (err) {
        alert(err.message);
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#fdfaf6] nature-bg">

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <div className={`${activeConvoId ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 lg:w-1/4 flex-col bg-white/80 backdrop-blur-md border-r border-[#e8f0eb] shadow-xl z-10`}>

        {/* Header */}
        <div className="bg-[#5c3a21] p-4 flex justify-between items-center text-white rounded-br-3xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#ffeedb] flex items-center justify-center font-bold text-[#5c3a21] shadow-inner text-xl">
              {profile?.name?.[0]?.toUpperCase() || 'M'}
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Messages</h2>
              <span className="text-xs text-[#d4a373]">KhetConnect Secure</span>
            </div>
          </div>
          <MoreVertical size={24} className="cursor-pointer text-[#ffeedb]" />
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#e8f0eb]">
          <div className="bg-[#fdfaf6] border border-[#e6b38c] rounded-full flex items-center px-4 py-2.5 gap-3 shadow-sm focus-within:ring-2 focus-within:ring-[#4a7c59]">
            <Search size={18} className="text-[#8b5e3c]" />
            <input type="text" placeholder="Search conversations..."
              className="bg-transparent outline-none w-full text-sm text-[#5c3a21] placeholder-[#a8b8ae]"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24">
          {loadingConvos ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 size={28} className="animate-spin text-[#4a7c59]" />
            </div>
          ) : filteredConvos.length === 0 ? (
            <div className="text-center py-16 text-[#8b5e3c] px-6">
              <MessageCircle size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-semibold text-sm">No conversations yet.</p>
              <p className="text-xs mt-1 opacity-60">Click "Contact Farmer/Seller" on a listing to start one.</p>
            </div>
          ) : (
            filteredConvos.map(convo => {
              const other = otherParticipant(convo);
              const isActive = convo._id === activeConvoId;
              return (
                <div key={convo._id}
                  onClick={() => { setActiveConvoId(convo._id); fetchMessages(convo._id); }}
                  className={`flex items-center p-4 cursor-pointer hover:bg-[#ffeedb]/30 transition-colors border-b border-[#e8f0eb]/50 ${
                    isActive ? 'bg-[#ffeedb]/50 border-l-4 border-l-[#d4a373]' : 'border-l-4 border-l-transparent'
                  }`}>
                  <div className="w-12 h-12 rounded-full bg-[#e8f0eb] text-[#4a7c59] flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm">
                    {other[0]?.toUpperCase()}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className="font-bold text-[#5c3a21] text-sm truncate">{other}</h3>
                      <span className="text-xs text-[#8b5e3c] flex-shrink-0 ml-2">
                        {new Date(convo.updatedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                      </span>
                    </div>
                    {convo.listingTitle && (
                      <p className="text-xs text-[#4a7c59] font-medium truncate">re: {convo.listingTitle}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Main Chat Area ────────────────────────────────────────────────── */}
      <div className={`${!activeConvoId ? 'hidden md:flex' : 'flex'} flex-1 flex-col relative`}>
        {activeConvo ? (
          <>
            {/* Chat header */}
            <div className="bg-white/90 backdrop-blur-sm p-4 flex items-center gap-4 border-b border-[#e8f0eb] z-20 shadow-sm">
              <button className="md:hidden text-[#8b5e3c] hover:bg-[#f6f8f6] p-2 rounded-full" onClick={() => setActiveConvoId(null)}>
                <ArrowLeft size={22} />
              </button>
              <div className="w-11 h-11 rounded-full bg-[#e8f0eb] text-[#4a7c59] flex items-center justify-center font-bold text-lg shadow-sm">
                {otherParticipant(activeConvo)[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#5c3a21]">{otherParticipant(activeConvo)}</h3>
                {activeConvo.listingTitle && (
                  <p className="text-xs text-[#4a7c59] truncate">🌾 re: {activeConvo.listingTitle}</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 z-10 pb-28">
              {loadingMsgs ? (
                <div className="flex justify-center pt-12"><Loader2 size={28} className="animate-spin text-[#4a7c59]"/></div>
              ) : messages.length === 0 ? (
                <div className="text-center pt-16 text-[#8b5e3c]">
                  <p className="text-sm font-semibold">No messages yet.</p>
                  <p className="text-xs mt-1 opacity-60">Say hello 👋</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender === profile?.name;

                  // Render System messages differently
                  if (msg.sender === 'System') {
                      const isDeal = msg.text.startsWith('✅ Deal Closed');
                      if (isDeal) {
                          const lines = msg.text.split(' | ');
                          return (
                            <div key={msg._id} className="flex justify-center my-4">
                              <div className="bg-white border-2 border-[#a9d4b6] rounded-2xl shadow-md px-5 py-4 max-w-xs w-full">
                                <p className="text-[#4a7c59] font-extrabold text-sm mb-3 flex items-center gap-2">
                                  <CheckCircle2 size={16}/> {lines[0]}
                                </p>
                                <div className="space-y-1.5 border-t border-[#e8f0eb] pt-3">
                                  {lines.slice(1).map((line, i) => (
                                    <p key={i} className="text-xs text-[#5c3a21] font-semibold">{line}</p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                      }
                      return (
                        <div key={msg._id} className="flex justify-center my-4">
                            <span className="bg-[#e8f0eb] text-[#4a7c59] text-xs font-bold px-4 py-1.5 rounded-full border border-[#a9d4b6] shadow-sm">
                                {msg.text}
                            </span>
                        </div>
                      );
                  }

                  // Render Offer cards
                  if (msg.isOffer) {
                      const { price, quantity, status, itemName } = msg.offerDetails || {};
                      const isPending = status === 'pending';
                      return (
                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`w-full max-w-[280px] md:max-w-[320px] rounded-2xl p-4 shadow-lg border-2 ${
                              isMe ? 'bg-[#f0faf5] border-[#4a7c59]' : 'bg-white border-[#e6b38c]'
                          }`}>
                              <div className="flex items-center gap-2 mb-3 border-b border-[#e6b38c]/40 pb-3">
                                  <FileSignature size={20} className={isMe ? 'text-[#4a7c59]' : 'text-[#d4a373]'}/>
                                  <h4 className="font-extrabold text-[#5c3a21] flex-1">Trade Offer</h4>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                      status === 'accepted' ? 'bg-[#e8f0eb] text-[#4a7c59]' :
                                      status === 'rejected' ? 'bg-red-50 text-red-500' :
                                      'bg-[#fff6ed] text-[#d4a373]'
                                  }`}>
                                      {status}
                                  </span>
                              </div>
                              <p className="text-sm font-semibold text-[#5c3a21] mb-1">{itemName}</p>
                              <div className="flex justify-between items-end mb-4">
                                  <div>
                                      <p className="text-xs text-[#8b5e3c]">Price</p>
                                      <p className="text-lg font-extrabold text-[#4a7c59]">₹{price?.toLocaleString('en-IN')}</p>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-xs text-[#8b5e3c]">Qty</p>
                                      <p className="text-lg font-extrabold text-[#5c3a21]">{quantity}</p>
                                  </div>
                              </div>
                              
                              {isPending && !isMe && (
                                  <div className="flex gap-2 mt-2 pt-3 border-t border-[#e6b38c]/40">
                                      <button onClick={() => handleRespond(msg._id, 'reject')}
                                          className="flex-1 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition-colors flex justify-center items-center gap-1">
                                          <XCircle size={16}/> Reject
                                      </button>
                                      <button onClick={() => handleRespond(msg._id, 'reject', {price, quantity})}
                                          className="flex-1 py-2 rounded-xl bg-orange-100 text-orange-600 text-sm font-bold hover:bg-orange-200 transition-colors flex justify-center items-center gap-1">
                                          Counter
                                      </button>
                                      <button onClick={() => handleRespond(msg._id, 'accept')}
                                          className="flex-1 py-2 rounded-xl bg-[#4a7c59] text-white text-sm font-bold hover:bg-[#3d6849] transition-colors flex justify-center items-center gap-1 shadow-md">
                                          <CheckCircle2 size={16}/> Accept
                                      </button>
                                  </div>
                              )}
                              {isPending && isMe && (
                                  <p className="text-xs text-center text-[#8b5e3c] italic mt-2">Waiting for response...</p>
                              )}
                              <div className={`text-[10px] mt-2 flex justify-end ${isMe ? 'text-[#a9d4b6]' : 'text-[#a8b8ae]'}`}>
                                {formatTime(msg.createdAt)}
                              </div>
                          </div>
                        </div>
                      );
                  }

                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] md:max-w-[60%] px-4 py-3 shadow-md relative ${
                        isMe
                          ? 'bg-[#4a7c59] text-white rounded-2xl rounded-tr-sm'
                          : 'bg-white text-[#5c3a21] rounded-2xl rounded-tl-sm border border-[#e8f0eb]'
                      }`}>
                        <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                        <div className={`text-[10px] mt-1.5 flex justify-end ${isMe ? 'text-[#a9d4b6]' : 'text-[#a8b8ae]'}`}>
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  );

                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 w-full bg-white/95 backdrop-blur-md p-3 sm:p-4 border-t border-[#e8f0eb] z-20 pb-8 sm:pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
              {showOfferForm && activeConvo.itemId && (
                  <form onSubmit={handleSendOffer} className="max-w-4xl mx-auto mb-3 bg-[#fdfaf6] border border-[#e6b38c] rounded-2xl p-4 shadow-sm relative">
                      <button type="button" onClick={() => setShowOfferForm(false)} className="absolute top-2 right-2 text-[#8b5e3c] p-1"><XCircle size={18}/></button>
                      <h4 className="font-extrabold text-[#5c3a21] text-sm mb-3 flex items-center gap-1.5"><FileSignature size={16}/> Make an Offer</h4>
                      <div className="flex gap-3 items-end">
                          <div className="flex-1">
                              <label className="block text-[10px] uppercase font-bold text-[#8b5e3c] mb-1">Total Price (₹)</label>
                              <input type="number" required placeholder="e.g. 5000" value={offerForm.price} onChange={e => setOfferForm({...offerForm, price: e.target.value})}
                                  className="w-full bg-white border border-[#e6b38c] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#4a7c59] outline-none"/>
                          </div>
                          <div className="flex-1">
                              <label className="block text-[10px] uppercase font-bold text-[#8b5e3c] mb-1">Quantity</label>
                              <input type="number" required placeholder="e.g. 10" value={offerForm.quantity} onChange={e => setOfferForm({...offerForm, quantity: e.target.value})}
                                  className="w-full bg-white border border-[#e6b38c] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#4a7c59] outline-none"
                                  disabled={activeConvo.marketType === 'equipment'} />
                          </div>
                          <button type="submit" disabled={sending}
                              className="bg-[#5c3a21] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#724a2c] disabled:opacity-50 transition-colors shadow-md">
                              Send
                          </button>
                      </div>
                  </form>
              )}

              <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3">
                {activeConvo.itemId && (
                    <button type="button" onClick={() => setShowOfferForm(s => !s)} title="Make Offer"
                        className={`p-3 rounded-full flex-shrink-0 transition-all ${showOfferForm ? 'bg-[#5c3a21] text-white' : 'bg-[#fff6ed] text-[#d4a373] hover:bg-[#ffeedb]'}`}>
                        <FileSignature size={20} />
                    </button>
                )}
                <form onSubmit={handleSend} className="flex-1 flex items-center gap-2 sm:gap-3">
                    <div className="flex-1 bg-[#fdfaf6] border border-[#e6b38c] rounded-full flex items-center px-4 py-1 shadow-inner focus-within:ring-2 focus-within:ring-[#4a7c59]">
                      <input type="text" placeholder="Type a message..."
                        className="w-full bg-transparent border-none py-2.5 sm:py-3 outline-none text-[#5c3a21] text-sm"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
                      />
                    </div>
                    <button type="submit" disabled={!text.trim() || sending}
                      className="bg-[#5c3a21] text-white p-3 sm:p-4 rounded-full shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex-shrink-0">
                      {sending ? <Loader2 size={20} className="animate-spin"/> : <Send size={20} className="ml-0.5"/>}
                    </button>
                </form>
              </div>
            </div>

          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10">
            <div className="w-28 h-28 bg-[#ffeedb] text-[#d4a373] rounded-full mb-8 flex items-center justify-center shadow-inner border-4 border-white">
              <Wheat size={56} />
            </div>
            <h2 className="text-3xl font-bold text-[#5c3a21] mb-3">KhetConnect Chat</h2>
            <p className="text-[#8b5e3c] max-w-sm text-base leading-relaxed">
              Select a conversation, or click <strong>"Contact Farmer/Seller"</strong> on any listing to start a new one.
            </p>
            <div className="mt-8 inline-flex items-center text-[#4a7c59] bg-[#e8f0eb] px-5 py-2.5 rounded-full text-sm font-semibold gap-2 border border-[#a8b8ae]/30">
              <ShieldCheck size={16}/> Secure &amp; Direct Trade
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
