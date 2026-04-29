import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, PlusCircle, X, MapPin, User, Loader2, RefreshCw, ImagePlus } from 'lucide-react';

import API from '../config';

const safeJson = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { return { message: `Server error (${res.status}): ${text.slice(0, 200)}` }; }
};

const EMOJI_MAP = { vehicle: '🚜', tool: '🔧', equipment: '⚙️' };

// ── Item Card ─────────────────────────────────────────────────────────────────
const ItemCard = ({ item, myName, token, onContact }) => {
  const isOwnListing = item.seller_name === myName;
  const imgSrc = item.hasImage ? `${API}/m2image/${item._id}` : null;

  return (
    <div className="heritage-card overflow-hidden hover:-translate-y-1 transition-transform flex flex-col">
      {/* Image banner */}
      {imgSrc ? (
        <div className="w-full h-44 overflow-hidden bg-[#e8f0eb] flex-shrink-0">
          <img
            src={imgSrc}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
      ) : (
        <div className="w-full h-32 bg-[#e8f0eb] flex items-center justify-center text-5xl flex-shrink-0">
          {EMOJI_MAP[item.type] || '📦'}
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        {/* Type badge */}
        <span className="self-start text-xs font-bold bg-[#f0faf5] text-[#4a7c59] border border-[#a9d4b6] px-3 py-1 rounded-full capitalize mb-2">
          {item.type || 'item'}
        </span>

        <h3 className="font-extrabold text-[#5c3a21] text-base leading-snug mb-1">{item.name}</h3>
        <p className="text-2xl font-extrabold text-[#d4a373] mb-3">₹{Number(item.price).toLocaleString('en-IN')}</p>

        <div className="flex flex-col gap-1 text-xs text-[#8b5e3c] mb-4">
          <span className="flex items-center gap-1.5"><MapPin size={12}/> {item.location}</span>
          <span className="flex items-center gap-1.5"><User size={12}/> {item.seller_name}</span>
        </div>

        <div className="mt-auto">
          {isOwnListing ? (
            <div className="w-full bg-[#e8f0eb] text-[#4a7c59] py-2.5 rounded-xl font-bold text-sm text-center">
              Your Listing
            </div>
          ) : (
            <button
              onClick={() => onContact(item.seller_name, item.name, item._id)}
              className="w-full bg-[#5c3a21] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#724a2c] transition-colors active:scale-95">
              Contact Seller
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export const FarmerMarketplace = () => {
  const { token, profile } = useAuth();
  const navigate = useNavigate();
  const myName   = profile?.name;
  const fileRef  = useRef(null);

  const handleContact = (sellerName, itemName, itemId) => {
    navigate(`/chat?with=${encodeURIComponent(sellerName)}&listing=${encodeURIComponent(itemName)}&itemId=${itemId}&market=equipment`);
  };

  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [searchTerm, setSearchTerm]   = useState('');
  const [activeType, setActiveType]   = useState('All');

  // Post form
  const [showForm, setShowForm]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [formErr, setFormErr]         = useState('');
  const [form, setForm]               = useState({ name: '', price: '', type: 'tool' });
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const typeFilters = ['All', 'Vehicle', 'Tool', 'Equipment'];

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (activeType !== 'All') params.set('type', activeType.toLowerCase());
      const res  = await fetch(`${API}/display2?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, activeType]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Auto-refresh every 30s so marketplace reflects live changes (sold items removed, quantities updated)
  useEffect(() => {
    const interval = setInterval(() => fetchItems(), 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeType]);

  // ── Client-side search filter ──────────────────────────────────────────────
  const filtered = items.filter(item => {
    const q = searchTerm.toLowerCase();
    return !q || item.name.toLowerCase().includes(q) || (item.location||'').toLowerCase().includes(q) || item.seller_name.toLowerCase().includes(q);
  });

  // ── Image picker ───────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  // ── Post new item (multipart/form-data so image is included) ──────────────
  const handlePost = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErr('');
    try {
      const fd = new FormData();
      fd.append('name',        form.name);
      fd.append('price',       form.price);
      fd.append('type',        form.type);
      fd.append('seller_name', profile?.name);
      if (imageFile) fd.append('img', imageFile);

      // NOTE: do NOT set Content-Type header — browser sets it with boundary for multipart
      const res  = await fetch(`${API}/list2`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.message || 'Failed to post');

      setShowForm(false);
      setForm({ name: '', price: '', type: 'tool' });
      clearImage();
      fetchItems();
    } catch (e) {
      setFormErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-white border border-[#e6b38c] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a7c59] text-[#5c3a21] placeholder-[#a8b8ae] text-sm";
  const labelCls = "block text-[#8b5e3c] font-semibold text-sm mb-1.5";

  return (
    <div className="min-h-screen bg-[#fdf8f5] nature-bg pb-28">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 bg-[#fdf8f5]/95 backdrop-blur-sm border-b border-[#e6b38c]/40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">

          {/* Title row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl flex-shrink-0">🚜</span>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#5c3a21] truncate">F2F Exchange</h1>
                <p className="text-[#8b5e3c] text-xs hidden sm:block">Trade tools &amp; equipment with fellow farmers</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={fetchItems} className="p-2 rounded-full bg-white border border-[#e6b38c] text-[#8b5e3c] hover:bg-[#fdfaf6]" title="Refresh">
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
              <button onClick={() => setShowForm(s => !s)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full font-bold text-sm transition-all shadow-md ${showForm ? 'bg-white text-[#5c3a21] border-2 border-[#5c3a21]' : 'bg-[#5c3a21] text-white hover:bg-[#724a2c]'}`}>
                {showForm ? <><X size={16}/> Cancel</> : <><PlusCircle size={16}/> Post Item</>}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-[#e6b38c] rounded-full px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-[#4a7c59] transition-all">
            <Search size={18} className="text-[#a8b8ae] flex-shrink-0"/>
            <input type="text" placeholder="Search tractors, pumps, tools..."
              className="bg-transparent outline-none w-full text-sm text-[#5c3a21] placeholder-[#a8b8ae]"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            {searchTerm && <button onClick={() => setSearchTerm('')}><X size={16} className="text-[#a8b8ae]"/></button>}
          </div>

          {/* Type filter pills */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {typeFilters.map(t => (
              <button key={t} onClick={() => setActiveType(t)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${activeType===t ? 'bg-[#5c3a21] text-white border-[#5c3a21]' : 'bg-white text-[#5c3a21] border-[#e6b38c] hover:border-[#5c3a21]'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ── Post Form ── */}
        {showForm && (
          <div className="mb-6 heritage-card p-5 sm:p-7 border-t-4 border-t-[#4a7c59]">
            <h2 className="text-xl font-extrabold text-[#5c3a21] mb-4 flex items-center gap-2">
              <PlusCircle size={20} className="text-[#4a7c59]"/> List Your Equipment
            </h2>
            {formErr && <p className="text-red-500 text-sm mb-3 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">⚠️ {formErr}</p>}

            <form onSubmit={handlePost} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Item Name</label>
                <input required type="text" placeholder="e.g. 5HP Water Pump" className={inputCls}
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>

              <div>
                <label className={labelCls}>Price (₹)</label>
                <input required type="number" placeholder="e.g. 15000" className={inputCls}
                  value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
              </div>

              <div>
                <label className={labelCls}>Type</label>
                <div className="flex gap-2">
                  {[['tool','🔧 Tool'],['vehicle','🚜 Vehicle'],['equipment','⚙️ Equipment']].map(([v,l]) => (
                    <button key={v} type="button" onClick={() => setForm({...form, type: v})}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${form.type===v ? 'bg-[#4a7c59] text-white border-[#4a7c59]' : 'bg-white text-[#5c3a21] border-[#e6b38c]'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Image Upload ── */}
              <div className="sm:col-span-2">
                <label className={labelCls}>Photo (optional)</label>
                {imagePreview ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border border-[#e6b38c]">
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover"/>
                    <button type="button" onClick={clearImage}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors">
                      <X size={14}/>
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-[#e6b38c] rounded-xl flex flex-col items-center justify-center gap-2 text-[#8b5e3c] hover:bg-[#fdfaf6] hover:border-[#5c3a21] transition-all">
                    <ImagePlus size={28} className="opacity-60"/>
                    <span className="text-sm font-semibold">Click to upload a photo</span>
                    <span className="text-xs opacity-60">JPG, PNG, WebP — max 5MB</span>
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange}/>
              </div>

              <div className="sm:col-span-2">
                <button type="submit" disabled={submitting}
                  className="w-full bg-[#5c3a21] hover:bg-[#724a2c] text-white py-3.5 rounded-xl font-extrabold text-base shadow-lg disabled:opacity-60 transition-all">
                  {submitting ? 'Posting...' : 'Submit Listing 🌾'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Body ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#8b5e3c]">
            <Loader2 size={40} className="animate-spin mb-4 text-[#4a7c59]"/>
            <p className="font-semibold">Loading items...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 heritage-card text-[#8b5e3c]">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="font-semibold mb-4">{error}</p>
            <button onClick={fetchItems} className="heritage-btn px-6 py-2.5">Try Again</button>
          </div>
        ) : (
          <>
            <p className="text-[#8b5e3c] text-sm font-medium mb-4">
              {filtered.length} item{filtered.length !== 1 ? 's' : ''} found
            </p>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filtered.map(item => (
                  <ItemCard key={item._id} item={item} myName={myName} token={token} onContact={handleContact} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 heritage-card text-[#8b5e3c]">
                <div className="text-5xl mb-4">🔧</div>
                <p className="text-lg font-semibold">No items match your search.</p>
                <button onClick={() => { setSearchTerm(''); setActiveType('All'); }}
                  className="mt-4 text-[#4a7c59] font-bold text-sm underline underline-offset-2">Clear filters</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
