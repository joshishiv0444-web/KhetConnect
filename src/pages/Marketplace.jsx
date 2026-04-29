import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, X, SlidersHorizontal, Loader2, RefreshCw, MapPin, User, Wheat, Calendar } from 'lucide-react';

import API from '../config';

// Safe JSON parser — returns text if not valid JSON so we don't crash
const safeJson = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { return { message: `Server error (${res.status}): ${text.slice(0, 200)}` }; }
};

// ── Pill Dropdown (reusable) ─────────────────────────────────────────────────
const CROPS = ['All Crops','Rice','Wheat','Cotton','Tomatoes','Onion','Potato','Sugarcane','Maize'];
const SORTS  = [
  { label: 'Latest First',       val: 'latest' },
  { label: 'Price: Low → High',  val: 'price-low' },
  { label: 'Price: High → Low',  val: 'price-high' },
];

const PillDropdown = ({ label, options, value, onSelect, isActive }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex-shrink-0">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-semibold whitespace-nowrap transition-all ${
          isActive ? 'bg-[#5c3a21] text-white border-[#5c3a21] shadow-md' : 'bg-white text-[#5c3a21] border-[#e6b38c] hover:border-[#5c3a21]'
        }`}>
        {label} <ChevronDown size={13} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-11 left-0 z-40 bg-white border border-[#e6b38c] rounded-2xl shadow-2xl py-2 min-w-[160px] overflow-hidden">
            {options.map(opt => {
              const v = typeof opt === 'object' ? opt.val : opt;
              const l = typeof opt === 'object' ? opt.label : opt;
              return (
                <button key={v} onClick={() => { onSelect(v); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${value===v ? 'bg-[#e8f0eb] text-[#4a7c59] font-bold' : 'text-[#5c3a21] hover:bg-[#fdfaf6]'}`}>
                  {value===v ? '✓ ' : ''}{l}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ── Listing Card ──────────────────────────────────────────────────────────────
const CropCard = ({ item, myName, onContact }) => {
  const isOwnListing = item.user === myName;
  return (
  <div className="heritage-card p-5 flex flex-col hover:-translate-y-1 transition-transform">
    <div className="flex items-start justify-between mb-3">
      <div className="w-12 h-12 bg-[#e8f0eb] rounded-2xl flex items-center justify-center text-2xl">🌾</div>
      <span className="text-xs font-bold bg-[#fdf8f5] text-[#d4a373] border border-[#e6b38c] px-3 py-1 rounded-full">{item.quantity} units</span>
    </div>
    <h3 className="font-extrabold text-[#5c3a21] text-base mb-1 capitalize">{item.crop}</h3>
    <p className="text-xl font-extrabold text-[#d4a373] mb-3">{item.price_unit}</p>
    <div className="flex flex-col gap-1 text-xs text-[#8b5e3c] mb-4">
      <span className="flex items-center gap-1.5"><MapPin size={12}/> {item.location}</span>
      <span className="flex items-center gap-1.5"><User size={12}/> {item.user}</span>
      <span className="flex items-center gap-1.5"><Calendar size={12}/> {item.date}</span>
    </div>
    <div className="mt-auto">
      {isOwnListing ? (
        <div className="w-full bg-[#e8f0eb] text-[#4a7c59] py-2.5 rounded-xl font-bold text-sm text-center">
          Your Listing
        </div>
      ) : (
        <button
          onClick={() => onContact(item.user, item.crop, item._id)}
          className="w-full bg-[#5c3a21] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#724a2c] transition-colors active:scale-95">
          Contact Farmer
        </button>
      )}
    </div>
  </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export const Marketplace = () => {
  const { token, profile } = useAuth();
  const navigate  = useNavigate();
  const isFarmer  = profile?.role === 'farmer';
  const myName    = profile?.name;

  const handleContact = (sellerName, cropName, itemId) => {
    navigate(`/chat?with=${encodeURIComponent(sellerName)}&listing=${encodeURIComponent(cropName)}&itemId=${itemId}&market=crop`);
  };

  const [listings, setListings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [cropFilter, setCropFilter] = useState('All Crops');
  const [sortMode, setSortMode]     = useState('latest');
  const [searchQ, setSearchQ]       = useState('');

  // ── Post form (farmers only) ──
  const [showForm, setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr]     = useState('');
  const [form, setForm] = useState({ crop: '', quantity: '', price_unit: '', date: '' });

  // ── Fetch from API ────────────────────────────────────────────────────────
  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (cropFilter !== 'All Crops') params.set('crop', cropFilter);
      const res = await fetch(`${API}/display1?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      let dbData = Array.isArray(data) ? data : [];

      // client-side sort
      if (sortMode === 'price-low')  dbData = [...dbData].sort((a,b) => a.price_unit.localeCompare(b.price_unit));
      if (sortMode === 'price-high') dbData = [...dbData].sort((a,b) => b.price_unit.localeCompare(a.price_unit));

      // client-side search
      if (searchQ.trim()) {
        const q = searchQ.toLowerCase();
        dbData = dbData.filter(d => d.crop.toLowerCase().includes(q) || d.location.toLowerCase().includes(q) || d.user.toLowerCase().includes(q));
      }

      setListings(dbData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, cropFilter, sortMode, searchQ]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  // Auto-refresh every 30s so marketplace reflects live quantity changes
  useEffect(() => {
    const interval = setInterval(() => fetchListings(), 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, cropFilter, sortMode, searchQ]);

  // ── Submit new listing ────────────────────────────────────────────────────
  const handlePost = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErr('');
    try {
      const res = await fetch(`${API}/list1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, user: profile?.name }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.message || 'Failed to post');
      setShowForm(false);
      setForm({ crop: '', quantity: '', price_unit: '', date: '' });
      fetchListings();
    } catch (e) {
      setFormErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-white border border-[#e6b38c] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a7c59] text-[#5c3a21] placeholder-[#a8b8ae] text-sm";
  const labelCls = "block text-[#8b5e3c] font-semibold text-sm mb-1.5";
  const activeCount = [cropFilter !== 'All Crops', sortMode !== 'latest'].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#fdf8f5] nature-bg pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-[#5c3a21] flex items-center gap-2">🏪 Crop Marketplace</h1>
            <p className="text-[#8b5e3c] mt-1 text-sm">Fresh produce listed by verified farmers across India</p>
          </div>
          {isFarmer && (
            <button onClick={() => setShowForm(s => !s)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm shadow-md transition-all ${showForm ? 'bg-white text-[#5c3a21] border-2 border-[#5c3a21]' : 'bg-[#5c3a21] text-white hover:bg-[#724a2c]'}`}>
              {showForm ? <><X size={15}/> Cancel</> : <><Wheat size={15}/> List My Crop</>}
            </button>
          )}
        </div>

        {/* ── Post Form (farmers only) ── */}
        {showForm && isFarmer && (
          <div className="mb-8 heritage-card p-6 border-t-4 border-t-[#4a7c59]">
            <h2 className="text-lg font-extrabold text-[#5c3a21] mb-4 flex items-center gap-2"><Wheat size={18}/> List Your Crop</h2>
            {formErr && <p className="text-red-500 text-sm mb-3 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">⚠️ {formErr}</p>}
            <form onSubmit={handlePost} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Crop Name</label>
                <input required type="text" placeholder="e.g. Basmati Rice" className={inputCls}
                  value={form.crop} onChange={e => setForm({...form, crop: e.target.value})} />
              </div>
              <div>
                <label className={labelCls}>Quantity (quintals/kg)</label>
                <input required type="number" placeholder="e.g. 50" className={inputCls}
                  value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
              </div>
              <div>
                <label className={labelCls}>Price per Unit (e.g. ₹2100/quintal)</label>
                <input required type="text" placeholder="₹2100/quintal" className={inputCls}
                  value={form.price_unit} onChange={e => setForm({...form, price_unit: e.target.value})} />
              </div>
              <div>
                <label className={labelCls}>Available From (Date)</label>
                <input required type="date" className={inputCls}
                  value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" disabled={submitting}
                  className="w-full bg-[#5c3a21] hover:bg-[#724a2c] text-white py-3.5 rounded-xl font-extrabold text-base shadow-lg disabled:opacity-60 transition-all">
                  {submitting ? 'Posting...' : '🌾 Submit Listing'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Filter Bar ── */}
        <div className="sticky top-0 z-20 bg-[#fdf8f5]/90 backdrop-blur-sm py-3 -mx-4 px-4 border-b border-[#e6b38c]/40 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1.5 text-[#5c3a21] font-bold text-sm shrink-0 pr-2 border-r border-[#e6b38c] mr-1">
              <SlidersHorizontal size={15}/> Filters
              {activeCount > 0 && <span className="bg-[#5c3a21] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeCount}</span>}
            </div>

            {/* Live search */}
            <div className="flex items-center gap-2 bg-white border border-[#e6b38c] rounded-full px-3 py-1.5 flex-shrink-0 focus-within:ring-2 focus-within:ring-[#4a7c59] transition-all">
              <input type="text" placeholder="Search..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
                className="bg-transparent outline-none text-sm text-[#5c3a21] w-28 placeholder-[#a8b8ae]" />
              {searchQ && <button onClick={() => setSearchQ('')}><X size={13} className="text-[#a8b8ae]"/></button>}
            </div>

            <PillDropdown
              label={cropFilter !== 'All Crops' ? cropFilter : 'Crop'}
              options={CROPS} value={cropFilter} onSelect={setCropFilter}
              isActive={cropFilter !== 'All Crops'}
            />
            <PillDropdown
              label={sortMode !== 'latest' ? (SORTS.find(s=>s.val===sortMode)?.label||'Sort') : 'Sort By'}
              options={SORTS} value={sortMode} onSelect={setSortMode}
              isActive={sortMode !== 'latest'}
            />

            {(activeCount > 0 || searchQ) && (
              <button onClick={() => { setCropFilter('All Crops'); setSortMode('latest'); setSearchQ(''); }}
                className="flex items-center gap-1 px-3 py-2 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 shrink-0">
                <X size={12}/> Clear
              </button>
            )}

            <button onClick={fetchListings} className="flex-shrink-0 ml-auto p-2 rounded-full bg-white border border-[#e6b38c] text-[#8b5e3c] hover:bg-[#fdfaf6] transition-colors" title="Refresh">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''}/>
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#8b5e3c]">
            <Loader2 size={40} className="animate-spin mb-4 text-[#4a7c59]"/>
            <p className="font-semibold">Loading listings...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 heritage-card text-[#8b5e3c]">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="font-semibold mb-4">{error}</p>
            <button onClick={fetchListings} className="heritage-btn px-6 py-2.5">Try Again</button>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 heritage-card text-[#8b5e3c]">
            <div className="text-5xl mb-4">🌾</div>
            <p className="text-xl font-semibold mb-2">No listings found.</p>
            <p className="text-sm opacity-70">Try clearing filters or check back later.</p>
          </div>
        ) : (
          <>
            <p className="text-[#8b5e3c] text-sm font-medium mb-5">{listings.length} listing{listings.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map(item => <CropCard key={item._id} item={item} myName={myName} onContact={handleContact} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
