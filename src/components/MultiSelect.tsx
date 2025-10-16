'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface MultiSelectProps {
  options: Array<{ value: string; label: string }>;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function MultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options...",
  className = "",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleRemoveValue = (value: string) => {
    onChange(selectedValues.filter(v => v !== value));
  };

  const selectedLabels = selectedValues.map(value => 
    options.find(option => option.value === value)?.label || value
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected values display */}
      <div
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 cursor-pointer min-h-[42px] flex items-center flex-wrap gap-1 bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValues.length === 0 ? (
          <span className="text-gray-500">{placeholder}</span>
        ) : (
          <>
            {selectedLabels.slice(0, 3).map((label, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {label}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveValue(selectedValues[index]);
                  }}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedValues.length > 3 && (
              <span className="text-sm text-gray-600">
                +{selectedValues.length - 3} more
              </span>
            )}
          </>
        )}
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search business types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm bg-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                  onClick={() => handleToggleOption(option.value)}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => {}} // Handled by parent div click
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">{option.label}</span>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="p-2 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => onChange([])}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear all
            </button>
            <button
              onClick={() => onChange(options.map(opt => opt.value))}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Select all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
