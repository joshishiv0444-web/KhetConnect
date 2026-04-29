import React, { useState } from 'react';
import { useListing } from '../context/ListingContext';
import { useAuth } from '../context/AuthContext';
import { Upload, X } from 'lucide-react';

export const AddListing = ({ onClose }) => {
  const [formData, setFormData] = useState({
    crop_name: '',
    title: '',
    quantity: '',
    unit: 'kg',
    price: '',
    location: '',
    description: '',
    quality: 'Standard',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { addListing } = useListing();
  const { user, profile } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!formData.crop_name || !formData.title || !formData.quantity || !formData.price) {
        throw new Error('Please fill all required fields');
      }

      let imageUrl = '';

      // Upload image if provided
      if (image) {
        const fileName = `${user.id}-${Date.now()}-${image.name}`;
        await storageService.uploadListingImage(image, fileName);
        imageUrl = storageService.getPublicImageUrl(`listings/${fileName}`);
      }

      // Create listing
      await addListing({
        crop_name: formData.crop_name,
        title: formData.title,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        price: parseFloat(formData.price),
        location: formData.location || profile?.location || '',
        description: formData.description,
        quality: formData.quality,
        image_url: imageUrl,
        farmer_id: user.id,
        farmer_name: profile?.name || 'Anonymous',
      });

      setFormData({
        crop_name: '',
        title: '',
        quantity: '',
        unit: 'kg',
        price: '',
        location: '',
        description: '',
        quality: 'Standard',
      });
      setImage(null);
      setImagePreview('');

      alert('Listing created successfully!');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Add New Listing</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={24} />
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Crop Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Crop Name *</label>
            <input
              type="text"
              name="crop_name"
              value={formData.crop_name}
              onChange={handleChange}
              placeholder="e.g., Basmati Rice"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Premium Basmati"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity *</label>
            <div className="flex gap-2">
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="50"
                required
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              />
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option>kg</option>
                <option>tons</option>
                <option>bags</option>
                <option>piece</option>
              </select>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="1800"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Your city"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Quality */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Quality</label>
            <select
              name="quality"
              value={formData.quality}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option>Standard</option>
              <option>Premium</option>
              <option>Organic</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Details about your product..."
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
          <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto mb-2" />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview('');
                  }}
                  className="text-red-600 text-sm hover:underline"
                >
                  Remove image
                </button>
              </>
            ) : (
              <>
                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                <label className="cursor-pointer text-blue-600 hover:text-blue-700">
                  <span>Click to upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Listing'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
