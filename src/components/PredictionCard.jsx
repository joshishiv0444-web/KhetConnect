import React from 'react';

export const PredictionCard = ({ prediction }) => {
  const isIncreasing = prediction.trend.includes('↑');
  const isDecreasing = prediction.trend.includes('↓');

  return (
    <div className="heritage-card p-6 md:p-8 border-t-8 border-t-[#4a7c59]">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-2xl font-bold text-[#5c3a21]">{prediction.crop}</h3>
        <div className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
          isIncreasing ? 'bg-[#e8f0eb] text-[#4a7c59] border border-[#a9d4b6]' :
          isDecreasing ? 'bg-[#fdf8f5] text-[#d4a373] border border-[#e6b38c]' :
          'bg-gray-100 text-gray-700'
        }`}>
          {prediction.trend}
        </div>
      </div>

      <div className="space-y-5">
        <div className="bg-[#fdfaf6] p-4 rounded-xl border border-[#e8f0eb]">
          <p className="text-sm text-[#8b5e3c] font-medium mb-1">Expected Price Range</p>
          <p className="text-3xl font-extrabold text-[#d4a373]">{prediction.priceRange}</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#8b5e3c] font-medium">AI Confidence</p>
            <p className="text-lg font-bold text-[#5c3a21]">{prediction.confidence}</p>
          </div>
          <div className="flex gap-1.5">
            {[...Array(5)].map((_, i) =>
              i < Math.round(parseInt(prediction.confidence) / 20) ? (
                <div key={i} className="h-2.5 w-8 bg-[#4a7c59] rounded-full"></div>
              ) : (
                <div key={i} className="h-2.5 w-8 bg-[#e8f0eb] rounded-full"></div>
              )
            )}
          </div>
        </div>

        <div className="bg-[#ffeedb]/50 p-4 rounded-xl border border-[#e6b38c]/50">
          <p className="text-sm text-[#5c3a21] leading-relaxed">
            <span className="font-bold text-[#d4a373]">Why? </span>
            {prediction.reasoning}
          </p>
        </div>

        <button className="w-full mt-6 heritage-btn px-6 py-3 text-lg">
          Get Full Analysis
        </button>
      </div>
    </div>
  );
};
