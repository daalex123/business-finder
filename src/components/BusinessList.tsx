'use client';

import { useState, useEffect } from 'react';
import { Business } from '@/types/business';
import { Star, Phone, Globe, MapPin, Clock, Download, ExternalLink } from 'lucide-react';
import Papa from 'papaparse';
import Image from 'next/image';

interface BusinessListProps {
  businesses: Business[];
  isLoading: boolean;
}

export default function BusinessList({ businesses, isLoading }: BusinessListProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedBusiness) {
        setSelectedBusiness(null);
      }
    };

    if (selectedBusiness) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedBusiness]);

  const exportToCSV = () => {
    const csvData = businesses.map(business => ({
      Name: business.name,
      Address: business.address,
      Phone: business.phone || '',
      Website: business.website || '',
      Rating: business.rating || '',
      'Total Reviews': business.user_ratings_total || '',
      'Price Level': business.price_level || '',
      Types: business.types.join(', '),
      Latitude: business.geometry.location.lat,
      Longitude: business.geometry.location.lng,
      'Open Now': business.opening_hours?.open_now ? 'Yes' : 'No',
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `businesses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  const getPriceLevel = (level?: number) => {
    if (!level) return '';
    return '$'.repeat(level);
  };

  const openInMaps = (business: Business) => {
    try {
      const { lat, lng } = business.geometry.location;
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${business.place_id}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening maps:', error);
      // Fallback to basic coordinates if place_id fails
      const { lat, lng } = business.geometry.location;
      const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formatWebsiteUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const getPhotoUrl = (photo: { photo_reference: string; height: number; width: number }) => {
    // If no photo reference, return a placeholder
    if (!photo.photo_reference) {
      return '/placeholder-image.jpg'; // You can add a placeholder image to public folder
    }
    
    // If it's already a full URL, return it
    if (photo.photo_reference.startsWith('http')) {
      return photo.photo_reference;
    }
    
    // Otherwise, it's a photo reference that needs to be converted
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Found {businesses.length} Businesses
        </h2>
        {businesses.length > 0 && (
          <button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {businesses.length === 0 ? (
        <div className="text-center py-12 flex-1 flex items-center justify-center">
          <div>
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No businesses found</h3>
            <p className="text-gray-400">
              Try adjusting your search criteria or location
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {businesses.map((business) => (
            <div
              key={business.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 
                  className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => setSelectedBusiness(business)}
                >
                  {business.name}
                </h3>
                <div className="flex items-center gap-2">
                  {business.rating && (
                    <div className="flex items-center gap-1">
                      <div className="flex">{renderStars(business.rating)}</div>
                      <span className="text-sm text-gray-600">
                        {business.rating} ({business.user_ratings_total})
                      </span>
                    </div>
                  )}
                  {business.price_level && (
                    <span className="text-sm font-medium text-green-600">
                      {getPriceLevel(business.price_level)}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{business.address}</span>
                </div>

                {business.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <a
                      href={`tel:${business.phone}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {business.phone}
                    </a>
                  </div>
                )}

                {business.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <a
                      href={formatWebsiteUrl(business.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      Visit Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openInMaps(business);
                    }}
                    className="hover:text-blue-600 transition-colors flex items-center gap-1 text-sm"
                  >
                    Open in Maps
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {business.opening_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className={business.opening_hours.open_now ? 'text-green-600' : 'text-red-600'}>
                      {business.opening_hours.open_now ? 'Open Now' : 'Closed'}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1 mt-2">
                  {business.types.slice(0, 3).map((type) => (
                    <span
                      key={type}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {type.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {business.types.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{business.types.length - 3} more
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedBusiness(business)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Business Detail Modal */}
      {selectedBusiness && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedBusiness(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedBusiness.name}
                </h2>
                <button
                  onClick={() => setSelectedBusiness(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {selectedBusiness.photos && selectedBusiness.photos.filter(photo => photo.photo_reference).length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedBusiness.photos
                      .filter(photo => photo.photo_reference)
                      .slice(0, 4)
                      .map((photo, index) => (
                        <div key={index} className="relative w-full h-32 bg-gray-200 rounded-lg overflow-hidden">
                          <Image
                            src={getPhotoUrl(photo)}
                            alt={`${selectedBusiness.name} photo ${index + 1}`}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              console.error('Failed to load image:', photo.photo_reference);
                              e.currentTarget.parentElement?.classList.add('hidden');
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully:', photo.photo_reference);
                            }}
                          />
                        </div>
                      ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedBusiness.address}</span>
                      </div>
                      {selectedBusiness.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${selectedBusiness.phone}`} className="hover:text-blue-600">
                            {selectedBusiness.phone}
                          </a>
                        </div>
                      )}
                      {selectedBusiness.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <a
                            href={formatWebsiteUrl(selectedBusiness.website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 flex items-center gap-1"
                          >
                            Visit Website
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <button
                          onClick={() => openInMaps(selectedBusiness)}
                          className="hover:text-blue-600 flex items-center gap-1"
                        >
                          Open in Maps
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Details</h3>
                    <div className="space-y-2 text-sm">
                      {selectedBusiness.rating && (
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(selectedBusiness.rating)}</div>
                          <span>
                            {selectedBusiness.rating} ({selectedBusiness.user_ratings_total} reviews)
                          </span>
                        </div>
                      )}
                      {selectedBusiness.price_level && (
                        <div>
                          Price Level: {getPriceLevel(selectedBusiness.price_level)}
                        </div>
                      )}
                      {selectedBusiness.opening_hours && (
                        <div>
                          <div className={selectedBusiness.opening_hours.open_now ? 'text-green-600' : 'text-red-600'}>
                            {selectedBusiness.opening_hours.open_now ? 'Open Now' : 'Closed'}
                          </div>
                          {selectedBusiness.opening_hours.weekday_text && (
                            <div className="mt-2">
                              <h4 className="font-medium">Hours:</h4>
                              <ul className="text-xs space-y-1">
                                {selectedBusiness.opening_hours.weekday_text.map((day, index) => (
                                  <li key={index}>{day}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Business Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBusiness.types.map((type) => (
                      <span
                        key={type}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {type.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
