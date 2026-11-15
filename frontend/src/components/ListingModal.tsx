import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { Listing } from '../types/listing';

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Listing>, imageFile?: File) => void;
  listing?: Listing | null;
  isEdit?: boolean;
}

const AVAILABLE_FACILITIES = [
  { key: 'ac', label: 'AC (Climate Control)' },
  { key: 'wifi', label: 'Wi-Fi (High-Speed)' },
  { key: 'pool', label: 'Swimming Pool' },
  { key: 'parking', label: 'Complimentary Parking' },
  { key: 'steamBath', label: 'Steam Bath / Wellness' },
  { key: 'kitchen', label: 'Kitchen' },
  { key: 'tv', label: 'HD Smart TV' },
];

export const ListingModal: React.FC<ListingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  listing,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    title: listing?.title || '',
    description: listing?.description || '',
    price: listing?.price || '',
    location: listing?.location || '',
    country: listing?.country || '',
    category: listing?.category || '',
    guests: listing?.guests || 2,
    amenities: (listing?.amenities && listing.amenities.length > 0)
      ? listing.amenities
      : ['wifi', 'ac'],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleAmenity = (key: string) => {
    const current = formData.amenities || [];
    const next = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    setFormData({ ...formData, amenities: next });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: Number(formData.price),
      guests: Number(formData.guests) || 2,
      amenities: formData.amenities,
    }, imageFile || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Edit Listing' : 'Host on Stay-Go'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Cozy Beachfront Villa"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#fe424d]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Tell guests about your place..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#fe424d] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Price / night (₹)</label>
              <input
                type="number"
                name="price"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 1200"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#fe424d]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Max Guests</label>
              <input
                type="number"
                name="guests"
                min="1"
                max="30"
                value={formData.guests}
                onChange={handleChange}
                placeholder="e.g. 2"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#fe424d]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#fe424d]"
              >
                <option value="" disabled>Select Category</option>
                <option value="mountains">Mountains</option>
                <option value="rooms">Rooms</option>
                <option value="pools">Pools</option>
                <option value="beach">Beach</option>
                <option value="farms">Farms</option>
                <option value="camping">Camping</option>
                <option value="domes">Domes</option>
                <option value="iconicCities">Iconic Cities</option>
                <option value="bedAndBreakfast">Bed & Breakfast</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          </div>

          {/* Dynamic Villa Facilities / Amenities Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              Villa Facilities / Amenities (Select which apply to this stay)
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {AVAILABLE_FACILITIES.map((facility) => {
                const isSelected = formData.amenities?.includes(facility.key);
                return (
                  <button
                    key={facility.key}
                    type="button"
                    onClick={() => toggleAmenity(facility.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-rose-50 border-[#fe424d] text-[#fe424d] shadow-2xs font-semibold'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{facility.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g. India"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#fe424d]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Location / City</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Goa"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#fe424d]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Upload Image (Optional)</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#fe424d] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#fe424d] file:text-white hover:file:bg-[#e03a44]"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-[#fe424d] hover:bg-[#e03a44] text-white font-bold py-3 rounded-xl transition shadow-md cursor-pointer"
            >
              {isEdit ? 'Save Changes' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
