import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Loader2, RefreshCw, TrendingUp, TrendingDown, Package,
  CheckCircle2, Clock, ChevronDown, ChevronUp, IndianRupee,
  BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

import API from '../config';

const safeJson = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { return { message: `Server error (${res.status}): ${text.slice(0, 200)}` }; }
};

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

// ── Summary Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className={`heritage-card p-5 flex items-start gap-4`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-[#8b5e3c] text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-extrabold text-[#5c3a21] mt-0.5">{value}</p>
      {sub && <p className="text-xs text-[#8b5e3c] mt-0.5">{sub}</p>}
    </div>
  </div>
);


// ── Item Row ───────────────────────────────────────────────────────────────────
const ItemRow = ({ item, onMarkSold, onRelist }) => {
  const [expanded, setExpanded] = useState(false);
  const profit = item.status === 'sold'
    ? item.soldPrice - item.costPrice - item.logisticsCost
    : null;

  return (
    <div className={`heritage-card overflow-hidden transition-all ${item.status === 'sold' ? 'opacity-90' : ''}`}>
      {/* Main row */}
      <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        {/* Icon */}
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${
          item.market === 'crop' ? 'bg-[#e8f0eb]' : 'bg-[#fff6ed]'
        }`}>
          {item.market === 'crop' ? '🌾' : '🚜'}
        </div>

        {/* Name + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-[#5c3a21] text-sm truncate capitalize">{item.name}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
              item.market === 'crop'
                ? 'bg-[#e8f0eb] text-[#4a7c59] border border-[#a9d4b6]'
                : 'bg-[#fff6ed] text-[#d4a373] border border-[#e6b38c]'
            }`}>
              {item.market === 'crop' ? 'Crop' : 'Equipment'}
            </span>
          </div>
          <p className="text-xs text-[#8b5e3c] mt-0.5">{item.listingPrice} · {item.location}</p>
        </div>

        {/* Status + P&L */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {item.status === 'sold' ? (
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <CheckCircle2 size={13} className="text-[#4a7c59]"/>
                <span className="text-xs font-bold text-[#4a7c59]">Sold</span>
              </div>
              <span className={`text-xs font-extrabold ${profit >= 0 ? 'text-[#4a7c59]' : 'text-red-500'}`}>
                {profit >= 0 ? '+' : '-'}₹{fmt(Math.abs(profit))}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Clock size={13} className="text-[#d4a373]"/>
              <span className="text-xs font-bold text-[#d4a373]">Active</span>
            </div>
          )}
          {expanded ? <ChevronUp size={16} className="text-[#8b5e3c]"/> : <ChevronDown size={16} className="text-[#8b5e3c]"/>}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[#e6b38c]/40 px-4 py-4 bg-[#fdfaf6] space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              ['Listing Price', item.listingPrice],
              ['Cost / Input', `₹${fmt(item.costPrice)}`],
              ['Logistics', `₹${fmt(item.logisticsCost)}`],
              item.status === 'sold'
                ? ['Sale Price', `₹${fmt(item.soldPrice)}`]
                : ['Qty/Units', item.quantity ?? 1],
            ].map(([l, v]) => (
              <div key={l} className="bg-white rounded-xl p-3 border border-[#e6b38c]/50">
                <p className="text-[10px] text-[#8b5e3c] font-semibold uppercase tracking-wide">{l}</p>
                <p className="text-sm font-extrabold text-[#5c3a21] mt-1">{v}</p>
              </div>
            ))}
          </div>

          {item.status === 'sold' && (
            <div className={`rounded-xl p-3 flex items-center gap-2 ${profit >= 0 ? 'bg-[#e8f0eb] text-[#4a7c59]' : 'bg-red-50 text-red-600'}`}>
              {profit >= 0 ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}
              <div>
                <span className="text-xs font-semibold">{profit >= 0 ? 'Net Profit' : 'Net Loss'}: </span>
                <span className="font-extrabold">₹{fmt(Math.abs(profit))}</span>
              </div>
              {item.soldDate && (
                <span className="ml-auto text-xs opacity-70">
                  Sold: {new Date(item.soldDate).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}
                </span>
              )}
            </div>
          )}

          {item.notes && (
            <p className="text-xs text-[#8b5e3c] bg-white border border-[#e6b38c]/50 rounded-xl px-3 py-2">
              📝 {item.notes}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {item.status === 'active' ? (
              <div className="flex-1 bg-[#fdfaf6] text-[#8b5e3c] py-2.5 rounded-xl text-xs font-bold text-center border border-[#e6b38c]/40">
                Awaiting offers in chat...
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onRelist(item); }}
                className="flex-1 bg-white text-[#5c3a21] py-2.5 rounded-xl text-sm font-bold border-2 border-[#5c3a21] hover:bg-[#fdfaf6] transition-colors">
                ↩ Relist
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export const Inventory = () => {
  const { token, profile } = useAuth();
  const navigate = useNavigate();

  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [tab, setTab]           = useState('all');    // 'all' | 'active' | 'sold'

  // Guard: only farmers
  useEffect(() => {
    if (profile && profile.role !== 'farmer') navigate('/marketplace', { replace: true });
  }, [profile, navigate]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchInventory = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/inventory`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  // ── Relist ─────────────────────────────────────────────────────────────────
  const handleRelist = async (item) => {
    try {
      const res = await fetch(`${API}/inventory/relist/${item.market}/${item._id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.message);
      fetchInventory();
    } catch (e) {
      alert(e.message);
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const soldItems   = items.filter(i => i.status === 'sold');
  const activeItems = items.filter(i => i.status === 'active');
  const totalProfit = soldItems.reduce((s, i) => s + (i.soldPrice - i.costPrice - i.logisticsCost), 0);
  const totalRevenue = soldItems.reduce((s, i) => s + i.soldPrice, 0);
  const totalCosts   = soldItems.reduce((s, i) => s + i.costPrice + i.logisticsCost, 0);

  const displayed = tab === 'active' ? activeItems : tab === 'sold' ? soldItems : items;

  return (
    <div className="min-h-screen bg-[#fdf8f5] nature-bg pb-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 relative z-10">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-[#5c3a21] flex items-center gap-2">
              <BarChart3 size={28} className="text-[#4a7c59]"/> My Inventory
            </h1>
            <p className="text-[#8b5e3c] mt-1 text-sm">
              Track sales, logistics costs &amp; profit across both marketplaces
            </p>
          </div>
          <button onClick={fetchInventory}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#e6b38c] text-[#8b5e3c] text-sm font-semibold hover:bg-[#fdfaf6] transition-colors shadow-sm">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''}/> Refresh
          </button>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Items" value={items.length}
            icon={Package} color="bg-[#e8f0eb] text-[#4a7c59]"
            sub={`${activeItems.length} active · ${soldItems.length} sold`} />
          <StatCard label="Revenue" value={`₹${fmt(totalRevenue)}`}
            icon={IndianRupee} color="bg-[#fff6ed] text-[#d4a373]"
            sub="from sold items" />
          <StatCard label="Total Costs" value={`₹${fmt(totalCosts)}`}
            icon={TrendingDown} color="bg-red-50 text-red-500"
            sub="input + logistics" />
          <StatCard
            label={totalProfit >= 0 ? 'Net Profit' : 'Net Loss'}
            value={`₹${fmt(Math.abs(totalProfit))}`}
            icon={totalProfit >= 0 ? TrendingUp : TrendingDown}
            color={totalProfit >= 0 ? 'bg-[#e8f0eb] text-[#4a7c59]' : 'bg-red-50 text-red-500'}
            sub={totalProfit >= 0 ? '🌱 Looking good!' : 'Review your costs'}
          />
        </div>

        {/* ── Tab Pills ── */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all',    label: `All (${items.length})` },
            { key: 'active', label: `🕒 Active (${activeItems.length})` },
            { key: 'sold',   label: `✓ Sold (${soldItems.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                tab === t.key
                  ? 'bg-[#5c3a21] text-white border-[#5c3a21] shadow-md'
                  : 'bg-white text-[#5c3a21] border-[#e6b38c] hover:border-[#5c3a21]'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Items List ── */}
        {loading ? (
          <div className="flex flex-col items-center py-24 text-[#8b5e3c]">
            <Loader2 size={36} className="animate-spin mb-3 text-[#4a7c59]"/>
            <p className="font-semibold">Loading inventory...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 heritage-card text-[#8b5e3c]">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="font-semibold mb-4">{error}</p>
            <button onClick={fetchInventory} className="heritage-btn px-6 py-2.5">Retry</button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 heritage-card text-[#8b5e3c]">
            <div className="text-5xl mb-4">{tab === 'sold' ? '✅' : '🌾'}</div>
            <p className="text-lg font-semibold">
              {tab === 'sold' ? 'No sold items yet.' : 'No listings found.'}
            </p>
            {tab !== 'sold' && (
              <p className="text-sm opacity-70 mt-1">Post items in the marketplaces to see them here.</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map(item => (
              <ItemRow
                key={`${item.market}-${item._id}`}
                item={item}
                onRelist={handleRelist}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
