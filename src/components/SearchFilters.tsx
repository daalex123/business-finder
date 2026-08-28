'use client';

import { useState, useCallback } from 'react';
import { SearchFilters as SearchFiltersType } from '@/types/business';
import { config } from '@/lib/config';
import { Search, Filter, Globe, Building2 } from 'lucide-react';
import MultiSelect from './MultiSelect';
import CitySelect from './CitySelect';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export default function SearchFilters({
  filters,
  onFiltersChange,
  onSearch,
  isLoading,
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof SearchFiltersType, value: string | number | boolean | string[] | null) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleCitySelect = useCallback(
    (city: { name: string; lat: number; lng: number }) => {
      onFiltersChange({
        ...filters,
        city: city.name,
        center: { lat: city.lat, lng: city.lng },
      });
    },
    [filters, onFiltersChange]
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Search Filters
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isExpanded ? 'Collapse' : 'Expand'} Filters
        </button>
      </div>

      <div className="mb-4">
        <CitySelect value={filters.city} onCitySelect={handleCitySelect} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Radius */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="block text-sm font-medium text-gray-700">
              {filters.radiusEnabled
                ? `Search Radius: ${filters.radius}m`
                : 'Search Radius: Full city'}
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.radiusEnabled}
                onChange={(e) => handleFilterChange('radiusEnabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Limit by radius
            </label>
          </div>
          <input
            type="range"
            min={config.searchRadius.min}
            max={config.searchRadius.max}
            step={config.searchRadius.step}
            value={filters.radius}
            onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
            disabled={!filters.radiusEnabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{filters.radiusEnabled ? '100m' : 'Disabled'}</span>
            <span>{filters.radiusEnabled ? '5km' : 'Searching whole city'}</span>
          </div>
        </div>

        {/* Business Types */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            Business Types
          </label>
          <MultiSelect
            options={config.businessTypes.map(type => ({
              value: type,
              label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }))}
            selectedValues={filters.businessTypes}
            onChange={(values) => handleFilterChange('businessTypes', values)}
            placeholder="Select business types..."
            className="w-full"
          />
        </div>

        {/* Website Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Globe className="w-4 h-4" />
            Website
          </label>
          <select
            value={filters.hasWebsite === null ? '' : filters.hasWebsite.toString()}
            onChange={(e) => {
              const value = e.target.value === '' ? null : e.target.value === 'true';
              handleFilterChange('hasWebsite', value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">Any</option>
            <option value="true">Has Website</option>
            <option value="false">No Website</option>
          </select>
        </div>
      </div>

      {/* Keyword Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Keyword Search
        </label>
        <input
          type="text"
          placeholder="e.g., pizza, coffee, 24/7, delivery..."
          value={filters.keyword}
          onChange={(e) => handleFilterChange('keyword', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
        />
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Price Level
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900">
                <option value="">Any Price</option>
                <option value="0">Free</option>
                <option value="1">$</option>
                <option value="2">$$</option>
                <option value="3">$$$</option>
                <option value="4">$$$$</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Minimum Rating
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900">
                <option value="">Any Rating</option>
                <option value="1">1+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={onSearch}
          disabled={isLoading || !filters.city}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Search Businesses
            </>
          )}
        </button>
      </div>
    </div>
  );
}
