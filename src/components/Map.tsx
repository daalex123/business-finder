'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { initializeGoogleMaps } from '@/lib/google-maps';
import { MapPin, Moon, Sun } from 'lucide-react';

type MapTheme = 'light' | 'dark';

const LIGHT_MAP_STYLES: google.maps.MapTypeStyle[] = [];

const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64779e' }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#334e87' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#283d6a' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6f9ba5' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3C7680' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#304a7d' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#98a5be' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2c6675' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#255763' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#b0d5ce' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#98a5be' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry.fill',
    stylers: [{ color: '#283d6a' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [{ color: '#3a4762' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1626' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4e6d70' }],
  },
];

interface MapProps {
  center: { lat: number; lng: number };
  city?: string;
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  businesses?: Array<{
    id: string;
    name: string;
    geometry: { location: { lat: number; lng: number } };
  }>;
  radius?: number;
  radiusEnabled?: boolean;
}

export default function Map({
  center,
  city = '',
  onLocationSelect,
  businesses = [],
  radius = 1000,
  radiusEnabled = true,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const centerMarkerRef = useRef<google.maps.Marker | null>(null);
  const radiusCircleRef = useRef<google.maps.Circle | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const previousCityRef = useRef(city);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<MapTheme>('light');
  const isDark = theme === 'dark';
  const accent = isDark ? '#38BDF8' : '#3B82F6';

  const addCenterMarkerAndRadius = useCallback((
    mapInstance: google.maps.Map,
    center: { lat: number; lng: number },
    radius: number,
    showRadius: boolean,
    markerColor: string
  ) => {
    if (centerMarkerRef.current) {
      centerMarkerRef.current.setMap(null);
    }
    if (radiusCircleRef.current) {
      radiusCircleRef.current.setMap(null);
      radiusCircleRef.current = null;
    }

    const marker = new google.maps.Marker({
      position: center,
      map: mapInstance,
      title: 'Search Center',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="${markerColor}" stroke="white" stroke-width="3"/>
            <circle cx="16" cy="16" r="6" fill="white"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16),
      },
    });

    centerMarkerRef.current = marker;

    if (showRadius) {
      const circle = new google.maps.Circle({
        strokeColor: markerColor,
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: markerColor,
        fillOpacity: 0.12,
        map: mapInstance,
        center: center,
        radius: radius,
      });
      radiusCircleRef.current = circle;
    }
  }, []);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) {
        return;
      }

      setIsLoading(true);
      setMapError(null);

      try {
        const google = await initializeGoogleMaps();

        if (mapRef.current) {
          mapRef.current.style.width = '100%';
          mapRef.current.style.height = '100%';
          mapRef.current.style.minHeight = '500px';
        }

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: center,
          zoom: 15,
          styles: LIGHT_MAP_STYLES,
          backgroundColor: '#ffffff',
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            onLocationSelect({
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
            });
          }
        });

        addCenterMarkerAndRadius(mapInstance, center, radius, radiusEnabled, '#3B82F6');

        setMap(mapInstance);
        setIsLoading(false);

        setTimeout(() => {
          google.maps.event.trigger(mapInstance, 'resize');
        }, 100);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(error instanceof Error ? error.message : 'Failed to load map');
        setIsLoading(false);
      }
    };

    initMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    map.setOptions({
      styles: isDark ? DARK_MAP_STYLES : LIGHT_MAP_STYLES,
      backgroundColor: isDark ? '#0e1626' : '#ffffff',
    });
  }, [map, isDark]);

  useEffect(() => {
    if (!map) return;

    const cityChanged = city !== previousCityRef.current;
    previousCityRef.current = city;

    map.panTo(center);
    if (cityChanged && city) {
      map.setZoom(12);
    }
    addCenterMarkerAndRadius(map, center, radius, radiusEnabled, accent);
  }, [map, center, city, radius, radiusEnabled, accent, addCenterMarkerAndRadius]);

  const createMarkers = useCallback(() => {
    if (!map) return [];

    return businesses.map(business => {
      const marker = new google.maps.Marker({
        position: business.geometry.location,
        map: map,
        title: business.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${accent}"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24),
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold text-sm">${business.name}</h3>
            <p class="text-xs text-gray-600">Click to search around this area</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        onLocationSelect(business.geometry.location);
      });

      return marker;
    });
  }, [map, businesses, onLocationSelect, accent]);

  useEffect(() => {
    if (!map) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = createMarkers();
  }, [map, createMarkers, businesses]);

  return (
    <div
      className={`w-full h-full min-h-[400px] rounded-lg overflow-hidden shadow-lg relative ${
        isDark ? 'bg-[#0e1626]' : 'bg-white'
      }`}
    >
      <div className="absolute top-3 right-3 z-20">
        <button
          type="button"
          onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium shadow-md border transition-colors ${
            isDark
              ? 'bg-slate-800 text-slate-100 border-slate-600 hover:bg-slate-700'
              : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
          }`}
          aria-label={isDark ? 'Switch to light map' : 'Switch to dark map'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {isDark ? 'Light' : 'Dark'}
        </button>
      </div>

      {isLoading && (
        <div
          className={`absolute inset-0 flex items-center justify-center z-10 ${
            isDark ? 'bg-[#0e1626]' : 'bg-gray-100'
          }`}
        >
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>Loading map...</p>
          </div>
        </div>
      )}

      {mapError && (
        <div
          className={`absolute inset-0 flex items-center justify-center z-10 ${
            isDark ? 'bg-[#0e1626]' : 'bg-gray-100'
          }`}
        >
          <div className="text-center p-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDark ? 'bg-red-900/40' : 'bg-red-100'
              }`}
            >
              <MapPin className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>
              Map Loading Error
            </h3>
            <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{mapError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        className="w-full h-full min-h-[500px]"
        style={{ width: '100%', height: '500px', minHeight: '500px' }}
      />
    </div>
  );
}
