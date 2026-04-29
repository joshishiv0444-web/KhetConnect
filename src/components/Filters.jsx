import React from 'react';
import { Filter } from 'lucide-react';

export const Filters = ({ filters, setFilters }) => {
  const [showFilters, setShowFilters] = React.useState(false);

  const crops = ['All Crops', 'Rice', 'Wheat', 'Cotton', 'Tomatoes', 'Tools'];
  const locations = ['All Locations', 'Punjab', 'Haryana', 'Himachal Pradesh', 'Telangana', 'Rajasthan', 'Uttar Pradesh'];
  const types = ['All', 'Crops', 'Tools'];

  return (
    <div className="heritage-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-[#5c3a21] flex items-center gap-2 border-b border-[#e6b38c] pb-2">
          <Filter size={20} className="text-[#d4a373]" />
          Filters
        </h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden heritage-btn px-4 py-2 text-sm"
        >
          {showFilters ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className={`${showFilters ? 'block' : 'hidden'} md:block space-y-4`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-[#8b5e3c] mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full bg-white/50 border border-[#e6b38c] rounded px-3 py-2 focus:outline-none focus:border-[#d4a373]"
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Crop Filter */}
          <div>
            <label className="block text-sm font-semibold text-[#8b5e3c] mb-2">Crop/Product</label>
            <select
              value={filters.crop}
              onChange={(e) => setFilters({ ...filters, crop: e.target.value })}
              className="w-full bg-white/50 border border-[#e6b38c] rounded px-3 py-2 focus:outline-none focus:border-[#d4a373]"
            >
              {crops.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-semibold text-[#8b5e3c] mb-2">Location</label>
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full bg-white/50 border border-[#e6b38c] rounded px-3 py-2 focus:outline-none focus:border-[#d4a373]"
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#8b5e3c] mb-2">Min Price (₹)</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              placeholder="0"
              className="w-full bg-white/50 border border-[#e6b38c] rounded px-3 py-2 focus:outline-none focus:border-[#d4a373]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#8b5e3c] mb-2">Max Price (₹)</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              placeholder="999999"
              className="w-full bg-white/50 border border-[#e6b38c] rounded px-3 py-2 focus:outline-none focus:border-[#d4a373]"
            />
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-semibold text-[#8b5e3c] mb-2">Min Rating</label>
          <select
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
            className="w-full bg-white/50 border border-[#e6b38c] rounded px-3 py-2 focus:outline-none focus:border-[#d4a373]"
          >
            <option value="0">All Ratings</option>
            <option value="3">3+ ⭐</option>
            <option value="4">4+ ⭐</option>
            <option value="4.5">4.5+ ⭐</option>
          </select>
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-semibold text-[#8b5e3c] mb-2">Sort By</label>
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="w-full bg-white/50 border border-[#e6b38c] rounded px-3 py-2 focus:outline-none focus:border-[#d4a373]"
          >
            <option value="latest">Latest</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="distance">Closest First</option>
          </select>
        </div>

        <button
          onClick={() => setFilters({
            type: 'All',
            crop: 'All Crops',
            location: 'All Locations',
            minPrice: '',
            maxPrice: '',
            rating: '0',
            sort: 'latest',
          })}
          className="w-full bg-[#fdf8f5] text-[#8b5e3c] border border-[#e6b38c] py-3 rounded hover:bg-[#ffeedb] transition font-semibold"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};
