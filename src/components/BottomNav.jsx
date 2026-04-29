import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Store, MessageCircle, LogOut, Compass, Tractor, Plus, Sparkles, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const BottomNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, profile, logout } = useAuth();

  const isActive = (path) => location.pathname === path;
  const isFarmer = profile?.role === 'farmer';

  // Farmer nav items (always 2 rows)
  const farmerLinks = [
    { to: '/',                   icon: <Home size={26} />,          label: 'Home',       color: '#5c3a21' },
    { to: '/marketplace',        icon: <Store size={26} />,         label: 'Market',     color: '#5c3a21' },
    { to: '/farmer-marketplace', icon: <Tractor size={26} />,       label: 'F2F Trade',  color: '#4a7c59', bgAlt: '#e8f0eb' },
    { to: '/inventory',          icon: <ClipboardList size={26} />, label: 'Inventory',  color: '#d4a373', bgAlt: '#fff6ed' },
    { to: '/chat',               icon: <MessageCircle size={26} />, label: 'Chat',       color: '#5c3a21' },
    { to: '/prediction',         icon: <Sparkles size={26} />,      label: 'AI Advice',  color: '#5c3a21' },
  ];

  // Buyer nav items — no AI prediction
  const buyerLinks = [
    { to: '/',            icon: <Home size={26} />,         label: 'Home',    color: '#5c3a21' },
    { to: '/marketplace', icon: <Store size={26} />,        label: 'Market',  color: '#5c3a21' },
    { to: '/chat',        icon: <MessageCircle size={26} />, label: 'Chat',   color: '#5c3a21' },
  ];

  const navLinks = isFarmer ? farmerLinks : buyerLinks;

  return (
    <div className="fixed bottom-5 left-0 w-full flex justify-center z-[200] pointer-events-none">
      <div className="relative pointer-events-auto">

        {/* ── Expanded Menu ── */}
        <div
          className={`absolute bottom-24 left-1/2 -translate-x-1/2 transition-all duration-300 origin-bottom ${
            isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'
          }`}
        >
          {isAuthenticated ? (
            <div className="flex flex-col items-center gap-3">

              {/* Nav icons in rows of 3 */}
              <div className="flex flex-wrap justify-center gap-3 max-w-[220px]">
                {navLinks.map(({ to, icon, label, color, bgAlt }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setIsOpen(false)}
                    className={`group relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 ${
                      isActive(to)
                        ? 'text-white scale-110 ring-2 ring-white/60'
                        : 'text-white/90 hover:ring-2 hover:ring-white/40'
                    }`}
                    style={{
                      backgroundColor: isActive(to) ? color : (bgAlt || '#4a7c59cc'),
                      boxShadow: `0 4px 20px ${color}55`,
                    }}
                  >
                    {icon}
                    <span className="absolute -top-8 bg-black/75 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-semibold shadow-lg">
                      {label}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Logout */}
              <button
                onClick={() => { logout(); setIsOpen(false); navigate('/auth'); }}
                className="group relative w-12 h-12 rounded-full bg-red-500/80 text-white flex items-center justify-center shadow-xl hover:bg-red-600 hover:scale-110 transition-all active:scale-95"
              >
                <LogOut size={22} />
                <span className="absolute -top-8 bg-black/75 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-semibold">
                  Logout
                </span>
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              onClick={() => setIsOpen(false)}
              className="bg-[#5c3a21] text-white px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-2 text-base hover:scale-105 transition-transform"
            >
              Join KhetConnect
            </Link>
          )}
        </div>

        {/* ── Main Button ── */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open navigation"
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-300 border-4 border-white shadow-[0_8px_32px_rgba(92,58,33,0.4)] ${
            isOpen ? 'bg-[#4a7c59] rotate-45 scale-90' : 'bg-[#5c3a21] hover:scale-110 active:scale-95'
          }`}
        >
          <Compass size={36} className={isOpen ? 'hidden' : 'block'} />
          <Plus size={44} className={isOpen ? 'block' : 'hidden'} />
        </button>
      </div>
    </div>
  );
};
