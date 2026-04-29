import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export const ChatBox = () => {
  const { messages, sendMessage } = useChat();
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = useRef(null);
  const currentUser = 'buyer'; // Demo as buyer
  const currentUserName = 'Priya Patel';
  const currentUserAvatar = '👩‍💼';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue, currentUser, currentUserName, currentUserAvatar);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-t-lg">
        <h3 className="font-bold text-lg">Raj Kumar (Farmer)</h3>
        <p className="text-xs text-blue-100">Online • Punjab</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.sender === currentUser ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender !== currentUser && (
              <span className="text-2xl">{msg.avatar}</span>
            )}
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.sender === currentUser
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-300 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs mt-1 opacity-70">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {msg.sender === currentUser && (
              <span className="text-2xl">{msg.avatar}</span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-white rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
