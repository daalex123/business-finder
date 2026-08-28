'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { config } from '@/lib/config';
import { geocodeCity, initializeGoogleMaps } from '@/lib/google-maps';
import { ChevronsUpDown, MapPinned, Search, X } from 'lucide-react';

interface CityOption {
  name: string;
  country: string;
  lat: number;
  lng: number;
  label: string;
}

interface CitySelectProps {
  value: string;
  onCitySelect: (city: { name: string; lat: number; lng: number }) => void;
  className?: string;
}

const presetCities: CityOption[] = config.cities.map((city) => ({
  ...city,
  label: `${city.name}, ${city.country}`,
}));

export default function CitySelect({ value, onCitySelect, className = '' }: CitySelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onCitySelectRef = useRef(onCitySelect);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [remoteCities, setRemoteCities] = useState<CityOption[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    onCitySelectRef.current = onCitySelect;
  }, [onCitySelect]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const filteredPresets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return presetCities;
    return presetCities.filter(
      (city) =>
        city.name.toLowerCase().includes(q) ||
        city.country.toLowerCase().includes(q) ||
        city.label.toLowerCase().includes(q)
    );
  }, [query]);

  const options = useMemo(() => {
    const seen = new Set(filteredPresets.map((c) => c.label.toLowerCase()));
    const extras = remoteCities.filter((c) => !seen.has(c.label.toLowerCase()));
    return [...filteredPresets, ...extras];
  }, [filteredPresets, remoteCities]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query, open]);

  useEffect(() => {
    const q = query.trim();
    if (!open || q.length < 2) {
      setRemoteCities([]);
      setLoadingRemote(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoadingRemote(true);
      try {
        await initializeGoogleMaps();
        const service = new google.maps.places.AutocompleteService();

        service.getPlacePredictions(
          { input: q, types: ['(cities)'] },
          async (predictions, status) => {
            if (cancelled) return;

            if (
              status !== google.maps.places.PlacesServiceStatus.OK ||
              !predictions?.length
            ) {
              setRemoteCities([]);
              setLoadingRemote(false);
              return;
            }

            const placesService = new google.maps.places.PlacesService(
              document.createElement('div')
            );

            const details = await Promise.all(
              predictions.slice(0, 6).map(
                (prediction) =>
                  new Promise<CityOption | null>((resolve) => {
                    placesService.getDetails(
                      {
                        placeId: prediction.place_id,
                        fields: ['formatted_address', 'geometry', 'name', 'address_components'],
                      },
                      (place, detailStatus) => {
                        const location = place?.geometry?.location;
                        if (
                          detailStatus !== google.maps.places.PlacesServiceStatus.OK ||
                          !location
                        ) {
                          resolve(null);
                          return;
                        }

                        const country =
                          place.address_components?.find((c) =>
                            c.types.includes('country')
                          )?.long_name || '';
                        const name = place.name || prediction.structured_formatting.main_text;
                        resolve({
                          name,
                          country,
                          lat: location.lat(),
                          lng: location.lng(),
                          label: place.formatted_address || `${name}${country ? `, ${country}` : ''}`,
                        });
                      }
                    );
                  })
              )
            );

            if (!cancelled) {
              setRemoteCities(details.filter((c): c is CityOption => c !== null));
              setLoadingRemote(false);
            }
          }
        );
      } catch {
        if (!cancelled) {
          setRemoteCities([]);
          setLoadingRemote(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  const selectCity = (city: CityOption) => {
    setError(null);
    setQuery(city.label);
    setOpen(false);
    onCitySelectRef.current({
      name: city.label,
      lat: city.lat,
      lng: city.lng,
    });
  };

  const searchTypedCity = async () => {
    const q = query.trim();
    if (!q) return;

    const exact = options.find(
      (city) =>
        city.label.toLowerCase() === q.toLowerCase() ||
        city.name.toLowerCase() === q.toLowerCase()
    );
    if (exact) {
      selectCity(exact);
      return;
    }

    setLoadingRemote(true);
    setError(null);
    try {
      const result = await geocodeCity(q);
      if (!result) {
        setError('City not found. Pick one from the list or try another name.');
        return;
      }
      selectCity({
        name: result.name,
        country: '',
        lat: result.lat,
        lng: result.lng,
        label: result.name,
      });
    } catch {
      setError('Could not look up that city. Try selecting from the list.');
    } finally {
      setLoadingRemote(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      setOpen(true);
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, Math.max(options.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (open && options[highlightIndex]) {
        selectCity(options[highlightIndex]);
      } else {
        void searchTypedCity();
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`} ref={containerRef}>
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
        <MapPinned className="w-4 h-4" />
        City
      </label>

      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError(null);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Type or select a city..."
            className="w-full pl-9 pr-16 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls="city-listbox"
            aria-autocomplete="list"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setRemoteCities([]);
                  setError(null);
                  setOpen(true);
                  inputRef.current?.focus();
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label="Clear city"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen((prev) => !prev);
                inputRef.current?.focus();
              }}
              className="p-1 text-gray-400 hover:text-gray-600"
              aria-label="Toggle city list"
            >
              <ChevronsUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {open && (
          <div
            id="city-listbox"
            role="listbox"
            className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
          >
            {options.length === 0 && !loadingRemote ? (
              <div className="px-3 py-3 text-sm text-gray-500">
                No cities match. Press Enter to search “{query.trim() || '…'}”.
              </div>
            ) : (
              options.map((city, index) => (
                <button
                  key={`${city.label}-${city.lat}-${city.lng}`}
                  type="button"
                  role="option"
                  aria-selected={index === highlightIndex}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-3 ${
                    index === highlightIndex
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onClick={() => selectCity(city)}
                >
                  <span className="font-medium">{city.name}</span>
                  <span className="text-xs text-gray-500">{city.country}</span>
                </button>
              ))
            )}
            {loadingRemote && (
              <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-100">
                Searching more cities…
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {!error && (
        <p className="text-xs text-gray-500">
          Type to filter, then pick a city — the map will jump there automatically
        </p>
      )}
    </div>
  );
}
