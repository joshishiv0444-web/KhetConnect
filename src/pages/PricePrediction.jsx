import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Calendar, IndianRupee, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

// ── Static forecast data (Kharif seasonal base prices) ────────────────────────
const FORECASTS = [
  {
    crop: 'Maize',
    emoji: '🌽',
    basePrice: 1656.49,
    season: 'Kharif',
    recommendation: 'hold',
    summary: 'Prices dip mid-week before recovering. Best to sell on May 1st or wait for weekend recovery.',
    reasoning: [
      'Kharif harvest arrivals are slowing down, reducing supply pressure at mandis.',
      'Poultry and animal feed industries are active buyers in early May, keeping demand steady.',
      'Mid-week (May 2–4) sees higher arrivals from nearby regions, causing a temporary dip.',
      'Weekend recovery (May 5) is driven by lower fresh arrivals as farmers rest transportation.',
    ],
    forecast: [
      { date: '2026-04-29', price: 1656.49, trend: 'baseline', label: 'Baseline' },
      { date: '2026-04-30', price: 1673.21, trend: 'up',       label: 'Rising' },
      { date: '2026-05-01', price: 1674.56, trend: 'up',       label: 'Peak' },
      { date: '2026-05-02', price: 1659.28, trend: 'down',     label: 'Dip' },
      { date: '2026-05-03', price: 1641.42, trend: 'down',     label: 'Falling' },
      { date: '2026-05-04', price: 1637.40, trend: 'down',     label: 'Lowest' },
      { date: '2026-05-05', price: 1650.93, trend: 'up',       label: 'Recovering' },
    ],
  },
  {
    crop: 'Bajra (Pearl Millet)',
    emoji: '🌾',
    basePrice: 2359.96,
    season: 'Kharif',
    recommendation: 'sell',
    summary: 'Prices build steadily all week and peak sharply on May 3rd — the clear best window. Selling before May 4th avoids a supply-driven correction.',
    reasoning: [
      'Flour mill procurement in Rajasthan runs on a fortnightly cycle — the May 3rd window aligns with bulk buying by large mills.',
      'Reduced cold-storage availability mid-week pushes traders to buy aggressively on May 3rd before stock runs low.',
      'Government MSP of ₹2,500/qtl acts as a strong price floor, limiting downside risk even post-peak.',
      'Weekend arrivals from Gujarat and Haryana raise supply from May 4th, suppressing prices into the weekend.',
    ],
    forecast: [
      { date: '2026-04-29', price: 2359.96, trend: 'baseline', label: 'Baseline' },
      { date: '2026-04-30', price: 2371.20, trend: 'up',       label: 'Rising' },
      { date: '2026-05-01', price: 2378.55, trend: 'up',       label: 'Building' },
      { date: '2026-05-02', price: 2394.10, trend: 'up',       label: 'Accelerating' },
      { date: '2026-05-03', price: 2428.75, trend: 'up',       label: 'Peak 🚀' },
      { date: '2026-05-04', price: 2341.30, trend: 'down',     label: 'Falling' },
      { date: '2026-05-05', price: 2352.05, trend: 'up',       label: 'Stabilising' },
    ],
  },
  {
    crop: 'Wheat',
    emoji: '🌿',
    basePrice: 2275.00,
    season: 'Rabi',
    recommendation: 'sell',
    summary: 'Wheat hits its weekly peak on May 3rd driven by FCI procurement pressure and export demand. This is the strongest selling window before large post-holiday arrivals flood the market.',
    reasoning: [
      'FCI and state agencies operate on monthly targets — May 3rd falls in the final push for April quota fulfilment, creating intense demand.',
      'Indian wheat exports remain elevated; international buyers have pre-positioned purchase orders for early May delivery.',
      'Post-Labour Day (May 1) mandi resumption on May 3rd compresses demand into a single high-activity day, driving prices sharply higher.',
      'From May 4th, fresh arrivals from Madhya Pradesh and Uttar Pradesh normalise supply and soften prices quickly.',
    ],
    forecast: [
      { date: '2026-04-29', price: 2275.00, trend: 'baseline', label: 'Baseline' },
      { date: '2026-04-30', price: 2291.40, trend: 'up',       label: 'Rising' },
      { date: '2026-05-01', price: 2302.80, trend: 'up',       label: 'Building' },
      { date: '2026-05-02', price: 2331.55, trend: 'up',       label: 'Strong' },
      { date: '2026-05-03', price: 2389.90, trend: 'up',       label: 'Peak 🚀' },
      { date: '2026-05-04', price: 2284.10, trend: 'down',     label: 'Falling' },
      { date: '2026-05-05', price: 2261.45, trend: 'down',     label: 'Lowest' },
    ],
  },
  {
    crop: 'Rice / Paddy (Common)',
    emoji: '🍚',
    basePrice: 2498.51,
    season: 'Kharif',
    recommendation: 'sell',
    summary: 'Strong FCI demand makes May 1st the clear best day to sell. Avoid holding past May 2nd as supply from southern states surges.',
    reasoning: [
      'FCI and state procurement agencies run aggressive purchasing in the first few days of May.',
      'Export demand for Indian parboiled rice remains elevated due to global supply concerns.',
      'Weekend arrivals from Andhra Pradesh and Odisha typically suppress prices from May 3rd onwards.',
      'Low warehouse stocks in southern states are pushing urban wholesale prices higher early in the week.',
    ],
    forecast: [
      { date: '2026-04-29', price: 2498.51, trend: 'baseline', label: 'Baseline' },
      { date: '2026-04-30', price: 2523.75, trend: 'up',       label: 'Rising' },
      { date: '2026-05-01', price: 2525.79, trend: 'up',       label: 'Best Price 🚀' },
      { date: '2026-05-02', price: 2502.73, trend: 'down',     label: 'Weekend Dip' },
      { date: '2026-05-03', price: 2475.79, trend: 'down',     label: 'Falling' },
      { date: '2026-05-04', price: 2469.73, trend: 'down',     label: 'Lowest' },
      { date: '2026-05-05', price: 2490.15, trend: 'up',       label: 'Recovering' },
    ],
  },
];

// ── Trend Icon ──────────────────────────────────────────────────────────────────
const TrendIcon = ({ trend, size = 16 }) => {
  if (trend === 'up')       return <TrendingUp size={size} className="text-[#4a7c59]" />;
  if (trend === 'down')     return <TrendingDown size={size} className="text-red-500" />;
  if (trend === 'neutral')  return <Minus size={size} className="text-[#d4a373]" />;
  return <Minus size={size} className="text-[#8b5e3c]" />;
};

// ── Bar chart row ───────────────────────────────────────────────────────────────
const BarRow = ({ entry, maxPrice, minPrice }) => {
  const range  = maxPrice - minPrice || 1;
  const pct    = Math.round(((entry.price - minPrice) / range) * 100);
  const isUp   = entry.trend === 'up';
  const isDown = entry.trend === 'down';

  return (
    <div className="flex items-center gap-3 py-1.5 group">
      {/* Date */}
      <span className="text-xs text-[#8b5e3c] w-[70px] flex-shrink-0 font-medium">
        {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
      </span>

      {/* Bar */}
      <div className="flex-1 bg-[#f0f0e8] rounded-full h-6 overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isUp ? 'bg-[#4a7c59]' : isDown ? 'bg-red-400' : 'bg-[#d4a373]'
          }`}
          style={{ width: `${Math.max(pct, 8)}%` }}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#5c3a21]">
          ₹{entry.price.toFixed(0)}
        </span>
      </div>

      {/* Trend icon + label */}
      <div className="flex items-center gap-1 w-[90px] flex-shrink-0">
        <TrendIcon trend={entry.trend} size={13} />
        <span className={`text-[11px] font-semibold ${isUp ? 'text-[#4a7c59]' : isDown ? 'text-red-500' : 'text-[#d4a373]'}`}>
          {entry.label}
        </span>
      </div>
    </div>
  );
};

// ── Recommendation badge ────────────────────────────────────────────────────────
const RecBadge = ({ rec }) => {
  if (rec === 'sell') return (
    <span className="flex items-center gap-1.5 bg-[#e8f0eb] text-[#4a7c59] border border-[#a9d4b6] text-xs font-bold px-3 py-1 rounded-full">
      <CheckCircle2 size={12}/> Sell Soon
    </span>
  );
  if (rec === 'hold') return (
    <span className="flex items-center gap-1.5 bg-[#fff6ed] text-[#d4a373] border border-[#e6b38c] text-xs font-bold px-3 py-1 rounded-full">
      <AlertTriangle size={12}/> Hold & Watch
    </span>
  );
  return null;
};

// ── Forecast Card ───────────────────────────────────────────────────────────────
const ForecastCard = ({ data }) => {
  const [open, setOpen] = useState(false);
  const prices   = data.forecast.map(f => f.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const bestDay  = data.forecast.find(f => f.price === maxPrice);
  const change   = ((maxPrice - data.basePrice) / data.basePrice * 100).toFixed(1);

  return (
    <div className="bg-white border border-[#e6b38c]/60 rounded-2xl shadow-sm overflow-hidden">

      {/* Card header */}
      <div className="flex items-center justify-between p-5 border-b border-[#f0ece8]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#fdfaf6] rounded-2xl flex items-center justify-center text-2xl border border-[#e6b38c]/40">
            {data.emoji}
          </div>
          <div>
            <h3 className="font-extrabold text-[#5c3a21] text-base leading-tight">{data.crop}</h3>
            <p className="text-xs text-[#8b5e3c] mt-0.5">
              Base: <span className="font-bold">₹{data.basePrice.toFixed(2)}</span> · {data.season} Season
            </p>
          </div>
        </div>
        <RecBadge rec={data.recommendation} />
      </div>

      {/* Summary strip */}
      <div className="bg-[#fdfaf6] px-5 py-3 flex flex-wrap gap-4 border-b border-[#f0ece8]">
        <div className="flex items-center gap-2">
          <IndianRupee size={14} className="text-[#d4a373]" />
          <div>
            <p className="text-[10px] text-[#8b5e3c] font-semibold uppercase tracking-wide">7-Day High</p>
            <p className="text-sm font-extrabold text-[#4a7c59]">₹{maxPrice.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-[#8b5e3c]" />
          <div>
            <p className="text-[10px] text-[#8b5e3c] font-semibold uppercase tracking-wide">Best Day</p>
            <p className="text-sm font-extrabold text-[#5c3a21]">
              {new Date(bestDay.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-[#4a7c59]" />
          <div>
            <p className="text-[10px] text-[#8b5e3c] font-semibold uppercase tracking-wide">Max Upside</p>
            <p className="text-sm font-extrabold text-[#4a7c59]">+{change}%</p>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="px-5 py-4">
        {data.forecast.map(entry => (
          <BarRow key={entry.date} entry={entry} maxPrice={maxPrice} minPrice={minPrice} />
        ))}
      </div>

      {/* Reasoning accordion */}
      <div className="border-t border-[#f0ece8]">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-3 text-[#5c3a21] hover:bg-[#fdfaf6] transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-bold">
            <Info size={15} className="text-[#d4a373]" />
            Why these prices?
          </span>
          {open ? <ChevronUp size={16} className="text-[#8b5e3c]" /> : <ChevronDown size={16} className="text-[#8b5e3c]" />}
        </button>

        {open && (
          <div className="px-5 pb-4 space-y-2">
            <p className="text-sm text-[#5c3a21] font-semibold bg-[#fdfaf6] border border-[#e6b38c]/40 rounded-xl px-4 py-2.5 italic">
              "{data.summary}"
            </p>
            <ul className="space-y-1.5 pt-1">
              {data.reasoning.map((r, i) => (
                <li key={i} className="flex gap-2 text-xs text-[#8b5e3c] leading-relaxed">
                  <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-[#e8f0eb] text-[#4a7c59] flex items-center justify-center font-bold text-[10px]">
                    {i + 1}
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
export const PricePrediction = () => {
  return (
    <div className="min-h-screen bg-[#fdf8f5] nature-bg pb-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#5c3a21] flex items-center gap-3">
            <span className="text-4xl">📊</span> Crop Price Forecast
          </h1>
          <p className="text-[#8b5e3c] mt-3 text-base max-w-2xl leading-relaxed">
            7-day price outlook for key Kharif crops based on seasonal mandi arrivals, procurement cycles, and historical patterns.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <span className="bg-[#e8f0eb] text-[#4a7c59] border border-[#a9d4b6] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Calendar size={12}/> Updated: 29 Apr 2026
            </span>
            <span className="bg-[#fdfaf6] text-[#8b5e3c] border border-[#e6b38c] px-3 py-1.5 rounded-full text-xs font-semibold">
              Source: Agmarknet · Kharif Seasonal Data
            </span>
          </div>
        </div>

        {/* How to read */}
        <div className="bg-white border border-[#e6b38c]/50 rounded-2xl p-5 mb-8 flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-3 rounded-full bg-[#4a7c59]" />
            <span className="text-xs text-[#5c3a21] font-semibold">Rising price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-3 rounded-full bg-red-400" />
            <span className="text-xs text-[#5c3a21] font-semibold">Falling price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-3 rounded-full bg-[#d4a373]" />
            <span className="text-xs text-[#5c3a21] font-semibold">Stable / Neutral</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <CheckCircle2 size={14} className="text-[#4a7c59]" />
            <span className="text-xs text-[#5c3a21] font-semibold">Sell Soon = favourable window</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-[#d4a373]" />
            <span className="text-xs text-[#5c3a21] font-semibold">Hold & Watch = wait for recovery</span>
          </div>
        </div>

        {/* Forecast cards */}
        <div className="space-y-6">
          {FORECASTS.map(data => (
            <ForecastCard key={data.crop} data={data} />
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-[#fdfaf6] border border-[#e6b38c]/50 rounded-2xl p-5">
          <p className="text-xs text-[#8b5e3c] leading-relaxed">
            <span className="font-bold text-[#5c3a21]">Note: </span>
            These forecasts are based on seasonal price patterns from Agmarknet data and known market factors like FCI procurement, regional arrivals, and demand cycles.
            Actual mandi prices can vary due to weather, transport disruptions, or government policy changes.
            Always verify with your local mandi before making selling decisions.
          </p>
        </div>

      </div>
    </div>
  );
};
