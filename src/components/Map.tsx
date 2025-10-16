'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { initializeGoogleMaps } from '@/lib/google-maps';
import { MapPin } from 'lucide-react';

interface MapProps {
  center: { lat: number; lng: number };
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  businesses?: Array<{
    id: string;
    name: string;
    geometry: { location: { lat: number; lng: number } };
  }>;
  radius?: number;
}

export default function Map({ center, onLocationSelect, businesses = [], radius = 1000 }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const centerMarkerRef = useRef<google.maps.Marker | null>(null);
  const radiusCircleRef = useRef<google.maps.Circle | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to add center marker and radius circle
  const addCenterMarkerAndRadius = useCallback((mapInstance: google.maps.Map, center: { lat: number; lng: number }, radius: number) => {
    // Remove existing center marker and circle
    if (centerMarkerRef.current) {
      centerMarkerRef.current.setMap(null);
    }
    if (radiusCircleRef.current) {
      radiusCircleRef.current.setMap(null);
    }

    // Create center marker
    const marker = new google.maps.Marker({
      position: center,
      map: mapInstance,
      title: 'Search Center',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" stroke-width="3"/>
            <circle cx="16" cy="16" r="6" fill="white"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16),
      },
    });

    // Create radius circle
    const circle = new google.maps.Circle({
      strokeColor: '#3B82F6',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#3B82F6',
      fillOpacity: 0.1,
      map: mapInstance,
      center: center,
      radius: radius,
    });

    centerMarkerRef.current = marker;
    radiusCircleRef.current = circle;
  }, []);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) {
        console.log('Map ref not available');
        return;
      }

      setIsLoading(true);
      setMapError(null);

      try {
        console.log('Initializing Google Maps...');
        const google = await initializeGoogleMaps();
        console.log('Google Maps loaded successfully');
        
        // Ensure the map container has proper dimensions
        if (mapRef.current) {
          mapRef.current.style.width = '100%';
          mapRef.current.style.height = '100%';
          mapRef.current.style.minHeight = '500px';
          console.log('Map container dimensions:', {
            width: mapRef.current.offsetWidth,
            height: mapRef.current.offsetHeight,
            clientWidth: mapRef.current.clientWidth,
            clientHeight: mapRef.current.clientHeight
          });
        }
        
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: center,
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        console.log('Map instance created');

        // Add click listener to map
        mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const location = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
            };
            onLocationSelect(location);
          }
        });

        // Add center marker and radius circle
        addCenterMarkerAndRadius(mapInstance, center, radius);

        setMap(mapInstance);
        setIsLoading(false);
        console.log('Map initialized successfully');
        
        // Trigger a resize event to ensure the map renders properly
        setTimeout(() => {
          if (mapInstance) {
            google.maps.event.trigger(mapInstance, 'resize');
          }
        }, 100);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(error instanceof Error ? error.message : 'Failed to load map');
        setIsLoading(false);
      }
    };

    initMap();
  }, [center, onLocationSelect, addCenterMarkerAndRadius, radius]);

  // Update map center when center prop changes
  useEffect(() => {
    if (map) {
      map.setCenter(center);
      addCenterMarkerAndRadius(map, center, radius);
    }
  }, [map, center, radius, addCenterMarkerAndRadius]);

  // Memoize the marker creation function
  const createMarkers = useCallback(() => {
    if (!map) return [];

    const newMarkers: google.maps.Marker[] = businesses.map(business => {
      const marker = new google.maps.Marker({
        position: business.geometry.location,
        map: map,
        title: business.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#3B82F6"/>
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

    return newMarkers;
  }, [map, businesses, onLocationSelect]);

  // Update business markers
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));

    // Create new markers
    const newMarkers = createMarkers();
    markersRef.current = newMarkers;
  }, [map, createMarkers, businesses]);

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden shadow-lg relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Map Loading Error</h3>
            <p className="text-gray-600 mb-4">{mapError}</p>
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
