import React from 'react';
import { Heart, MapPin, Star } from 'lucide-react';
import { useListing } from '../context/ListingContext';

export const ListingCard = ({ listing }) => {
  const { toggleFavorite, isFavorite } = useListing();
  const favorite = isFavorite(listing.id);

  return (
    <div className="heritage-card hover:-translate-y-1 transition-transform overflow-hidden">
      <div className="relative bg-[#ffeedb] border-b border-[#e6b38c] p-6 h-32 flex items-center justify-center">
        <span className="text-6xl">{listing.image}</span>
        <button
          onClick={() => toggleFavorite(listing.id)}
          className={`absolute top-3 right-3 p-2 rounded-full transition ${
            favorite ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          <Heart size={20} fill={favorite ? 'white' : 'none'} />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-[#5c3a21]">{listing.name}</h3>
        <p className="text-sm text-[#8b5e3c] mb-2">{listing.quality}</p>

        <div className="flex items-center gap-1 text-[#8b5e3c] text-sm mb-3">
          <MapPin size={16} />
          <span>{listing.location}</span>
          <span className="text-xs opacity-70">({listing.distance} km)</span>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <Star size={16} className="text-[#d4a373]" fill="#d4a373" />
          <span className="text-sm font-semibold text-[#5c3a21]">{listing.rating}</span>
          <span className="text-xs text-[#8b5e3c]">({listing.reviews} reviews)</span>
        </div>

        <div className="border-t border-[#e6b38c] pt-3 mb-3">
          <p className="text-xs text-[#8b5e3c]">Quantity:</p>
          <p className="font-semibold text-[#5c3a21]">{listing.quantity} {listing.unit}</p>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-[#8b5e3c]">Price</p>
            <p className="text-xl font-bold text-[#d4a373]">₹{listing.price}</p>
            <p className="text-xs text-[#8b5e3c]">{listing.priceUnit}</p>
          </div>
          <button className="heritage-btn px-4 py-2">
            Contact
          </button>
        </div>

        <p className="text-xs text-[#8b5e3c] mt-3 italic">Seller: {listing.farmer}</p>
      </div>
    </div>
  );
};
