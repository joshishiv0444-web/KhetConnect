import React, { createContext, useState, useContext, useEffect } from 'react';
import { dummyListings } from '../data/dummyListings';

const ListingContext = createContext();

export const ListingProvider = ({ children }) => {
  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // initialize with dummy data for UI-only mode
    setListings(dummyListings);
  }, []);

  const fetchListings = async (filters = {}) => {
    setIsLoading(true);
    try {
      // in-memory filtering for demo
      let result = [...listings];
      if (filters.crop_name) result = result.filter(l => l.name.toLowerCase().includes(filters.crop_name.toLowerCase()));
      if (filters.location) result = result.filter(l => l.location === filters.location);
      if (filters.minPrice) result = result.filter(l => l.price >= filters.minPrice);
      if (filters.maxPrice) result = result.filter(l => l.price <= filters.maxPrice);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const addListing = async (listingData) => {
    const newListing = {
      id: Date.now(),
      image: listingData.image_url || listingData.image || '🌾',
      farmer: listingData.farmer_name || 'You',
      created_at: new Date().toISOString(),
      ...listingData,
    };
    setListings(prev => [newListing, ...prev]);
    return newListing;
  };

  const updateListing = async (id, updates) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    return listings.find(l => l.id === id);
  };

  const deleteListing = async (id) => {
    setListings(prev => prev.filter(l => l.id !== id));
  };

  const toggleFavorite = (listingId) => {
    setFavorites(prev => prev.includes(listingId) ? prev.filter(id => id !== listingId) : [...prev, listingId]);
  };

  const isFavorite = (listingId) => favorites.includes(listingId);

  return (
    <ListingContext.Provider value={{ listings, favorites, isLoading, addListing, updateListing, deleteListing, toggleFavorite, isFavorite, fetchListings }}>
      {children}
    </ListingContext.Provider>
  );
};

export const useListing = () => {
  const context = useContext(ListingContext);
  if (!context) throw new Error('useListing must be used within ListingProvider');
  return context;
};
