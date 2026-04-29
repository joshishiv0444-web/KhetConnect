import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Sprout } from 'lucide-react';

// Leaf variants only — no cringe fruits 🌿
const FALLING = ['🌿','🍃','🌿','🍂','🌱','🌿','🍃','🌾','🌿','🍃','🌱','🌿','🌾','🍃','🌿','🌱','🍃','🌿','🌾','🌿'];

const stats = [
  { label: 'Farmers', value: '12,000+' },
  { label: 'States Covered', value: '22' },
  { label: 'Tonnes Traded', value: '8,500+' },
  { label: 'Trust Score', value: '4.9 ⭐' },
];

const pillars = [
  {
    emoji: '🌾',
    title: 'Pure Harvest',
    desc: 'Connect directly with the source. Buy authentic, fresh produce without middlemen cutting into fair prices.',
  },
  {
    emoji: '🚜',
    title: 'Farmer Unity',
    desc: 'A dedicated F2F space for farmers to trade tractors, tools, and share generational wisdom of the soil.',
  },
  {
    emoji: '🛡️',
    title: 'Trusted Trade',
    desc: 'Verified profiles, secure conversations, and transparent pricing — the way trade should always have been.',
  },
  {
    emoji: '📊',
    title: 'Smart Pricing',
    desc: 'AI-driven mandi price insights so you always sell at the right time, to the right buyer, at the right price.',
  },
];

export const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen font-sans overflow-x-hidden">

      {/* ── Falling Items Layer ── */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {FALLING.map((item, i) => (
          <span key={i} className="falling-item">{item}</span>
        ))}
      </div>

      {/* ── HERO ── full-screen gradient */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1a3d2b 0%, #2d6145 30%, #4a7c59 55%, #3b5e2d 75%, #5c3a21 100%)'
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#d4a373]/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5" />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm text-[#ffe8b6] text-sm font-semibold px-5 py-2 rounded-full mb-10 shadow-lg">
            <Sprout size={16} /> India's Farmer-First Marketplace
          </div>

          <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-white mb-8 tracking-tight leading-none drop-shadow-2xl">
            खेत से
            <span className="block text-[#ffe8b6] italic">घर तक।</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-[#c8e6d4] max-w-3xl mx-auto mb-6 leading-relaxed font-light">
            "From the Field to Your Home" — KhetConnect connects the hands that grow India's food directly to the families that eat it. No middlemen. Pure trust. Real prices.
          </p>
          <p className="text-base text-white/50 mb-12 font-medium tracking-wider uppercase">Jai Jawan · Jai Kisan</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={isAuthenticated ? '/marketplace' : '/auth'}
              className="inline-flex items-center gap-2 bg-[#ffe8b6] hover:bg-[#ffd980] text-[#5c3a21] px-10 py-4 rounded-full font-bold text-lg shadow-[0_8px_30px_rgba(255,232,182,0.3)] hover:-translate-y-1 transition-all duration-200"
            >
              Enter Marketplace <ArrowRight size={20} />
            </Link>
            {!isAuthenticated && (
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-10 py-4 rounded-full font-bold text-lg backdrop-blur-sm hover:-translate-y-1 transition-all duration-200"
              >
                Join Free
              </Link>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 mt-20 w-full max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl p-5 text-center hover:bg-white/15 transition-colors">
              <p className="text-3xl font-extrabold text-[#ffe8b6]">{s.value}</p>
              <p className="text-white/70 text-sm mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 text-xs animate-bounce">
          <span>Scroll down</span>
          <div className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center pt-1">
            <div className="w-1 h-2 rounded-full bg-white/40 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Pillars of Growth ── */}
      <section className="py-28 bg-[#fdf8f5] relative">
        <div className="absolute inset-0 nature-bg opacity-60" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-[#4a7c59] font-bold text-sm tracking-widest uppercase">Why KhetConnect</span>
            <h2 className="text-5xl font-extrabold text-[#5c3a21] mt-3 mb-5">Built for Bharat's Farmers</h2>
            <div className="flex items-center justify-center gap-3">
              <div className="w-16 h-1 bg-[#4a7c59] rounded-full" />
              <span className="text-2xl">🌾</span>
              <div className="w-16 h-1 bg-[#4a7c59] rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((p) => (
              <div key={p.title} className="heritage-card p-8 text-center group hover:-translate-y-3 transition-transform duration-300 cursor-default">
                <div className="text-5xl mb-6 group-hover:scale-125 transition-transform duration-300 inline-block">{p.emoji}</div>
                <h3 className="text-xl font-bold text-[#5c3a21] mb-3">{p.title}</h3>
                <p className="text-[#8b5e3c] leading-relaxed text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote Section ── */}
      <section
        className="py-28 text-white text-center px-6"
        style={{ background: 'linear-gradient(135deg, #2d4f37 0%, #4a7c59 50%, #5c3a21 100%)' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-6xl mb-8">🙏</div>
          <blockquote className="text-3xl md:text-4xl font-bold italic mb-8 leading-snug">
            "उत्तम खेती, मध्यम बान, अधम चाकरी, भीख निदान।"
          </blockquote>
          <p className="text-white/60 text-base mb-12">— Ancient Indian proverb honoring the farmer above all</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={isAuthenticated ? '/marketplace' : '/auth'}
              className="inline-flex items-center gap-2 bg-[#ffe8b6] text-[#5c3a21] px-8 py-4 rounded-full font-bold text-lg hover:-translate-y-1 transition-transform shadow-xl">
              Start Trading Today <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="py-14 text-center text-white"
        style={{ background: '#1a3d2b' }}
      >
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-5xl mb-4">🌾</div>
          <h2 className="text-2xl font-bold mb-3">KhetConnect</h2>
          <p className="text-white/50 mb-6 text-sm leading-relaxed">
            Honoring the soil. Empowering the soul.<br />Building a sustainable future for Indian agriculture.
          </p>
          <div className="flex justify-center gap-6 text-white/40 text-sm mb-6">
            <Link to="/auth" className="hover:text-white transition-colors">Login</Link>
            <Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
            <Link to="/chat" className="hover:text-white transition-colors">Chat</Link>
          </div>
          <p className="text-white/30 text-xs">© 2024 KhetConnect. Proudly made in India 🇮🇳</p>
        </div>
      </footer>
    </div>
  );
};
