'use client';

import { useState } from 'react';
import { Business, SearchFilters } from '@/types/business';
import { searchBusinesses } from '@/lib/google-maps';
import { config } from '@/lib/config';
import Map from '@/components/Map';
import SearchFiltersComponent from '@/components/SearchFilters';
import BusinessList from '@/components/BusinessList';
import { MapPin, Search } from 'lucide-react';

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<SearchFilters>({
    city: '',
    businessTypes: [],
    hasWebsite: null,
    keyword: '',
    radiusEnabled: true,
    radius: config.searchRadius.default,
    center: {
      lat: 40.7128,
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
    if (!filters.city) {
      setError('Please select a city first');
      return;
    }

    if (!filters.center.lat || !filters.center.lng) {
      setError('Please select a city to set the search location');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await searchBusinesses({
        city: filters.city,
        center: filters.center,
        radiusEnabled: filters.radiusEnabled,
        radius: filters.radius,
        businessTypes: filters.businessTypes,
        keyword: filters.keyword,
      });

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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Business Finder</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <SearchFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
            isLoading={isLoading}
          />

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Interactive Map
                  {filters.city ? (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      — {filters.city}
                    </span>
                  ) : null}
                </h2>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-4 h-[600px]">
                <Map
                  center={filters.center}
                  city={filters.city}
                  onLocationSelect={handleLocationSelect}
                  businesses={businesses}
                  radius={filters.radius}
                  radiusEnabled={filters.radiusEnabled}
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">How to use:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Select a city</strong> to set the search center</li>
                  <li>• Optionally click the map to fine-tune the center</li>
                  <li>• Use <strong>Limit by radius</strong>, or turn it off to search the whole city</li>
                  <li>• Select business type and add keywords</li>
                  <li>• Use the website filter if needed</li>
                  <li>• Click <strong>Search Businesses</strong> to find results</li>
                </ul>
              </div>
            </div>

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
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p className="mb-2">
              <strong>Business Finder</strong> — Find businesses by city
            </p>
            <p className="text-sm">
              Powered by Google Maps. Select a city, then search for businesses in that area.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
