'use client';

import { useState } from 'react';
import { Business, SearchFilters } from '@/types/business';
import { searchNearbyBusinesses } from '@/lib/google-maps';
import { config } from '@/lib/config';
import Map from '@/components/Map';
import SearchFiltersComponent from '@/components/SearchFilters';
import BusinessList from '@/components/BusinessList';
import RedditSearch from '@/components/RedditSearch';
import { MapPin, Search, MessageSquare } from 'lucide-react';

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'reddit'>('map');

  const [filters, setFilters] = useState<SearchFilters>({
    businessTypes: [],
    hasWebsite: null,
    keyword: '',
    radius: config.searchRadius.default,
    center: {
      lat: 40.7128, // Default to New York City
      lng: -74.0060,
    },
  });


  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setFilters(prev => ({
      ...prev,
      center: location,
    }));
  };

  const handleSearch = async () => {
    if (!filters.center.lat || !filters.center.lng) {
      setError('Please select a location on the map');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await searchNearbyBusinesses(
        filters.center,
        filters.radius,
        filters.businessTypes,
        filters.keyword
      );

      // Filter by website availability if specified
      let filteredResults = results;
      if (filters.hasWebsite !== null) {
        filteredResults = results.filter(business => 
          filters.hasWebsite ? !!business.website : !business.website
        );
      }

      setBusinesses(filteredResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      setBusinesses([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Business Finder</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('map')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === 'map'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Map Search
                </button>
                <button
                  onClick={() => setActiveTab('reddit')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === 'reddit'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Reddit Solutions
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'map' ? (
          <div className="space-y-6">
            {/* Search Filters */}
            <SearchFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={handleSearch}
              isLoading={isLoading}
            />

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Map and Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Map */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Interactive Map</h2>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-4 h-[600px]">
                  <Map
                    center={filters.center}
                    onLocationSelect={handleLocationSelect}
                    businesses={businesses}
                    radius={filters.radius}
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">How to use:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Click anywhere on the map</strong> to set the search center</li>
                    <li>• Adjust the <strong>Search Radius</strong> slider to control search area</li>
                    <li>• Select business type and add keywords for specific searches</li>
                    <li>• Use the website filter to find businesses with/without websites</li>
                    <li>• Click &quot;Search Businesses&quot; to find results around your selected location</li>
                  </ul>
                </div>
              </div>

              {/* Business List */}
              <div className="space-y-4 h-[600px] flex flex-col">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Search Results</h2>
                </div>
                <div className="flex-1 overflow-hidden">
                  <BusinessList businesses={businesses} isLoading={isLoading} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <RedditSearch />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p className="mb-2">
              <strong>Business Finder</strong> - Find businesses and discover solutions
            </p>
            <p className="text-sm">
              Powered by Google Maps API and Reddit. Click on the map to search for businesses in any area.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}