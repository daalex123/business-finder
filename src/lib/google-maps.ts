import { Business } from '@/types/business';

// Extend the Google Maps PlacePhoto type to include photo_reference
interface ExtendedPlacePhoto extends google.maps.places.PlacePhoto {
    photo_reference?: string;
}

let googleMapsInstance: typeof google | null = null;
let loadingPromise: Promise<typeof google> | null = null;

export const initializeGoogleMaps = async (): Promise<typeof google> => {
    if (googleMapsInstance) {
        return googleMapsInstance;
    }

    if (loadingPromise) {
        return loadingPromise;
    }

    loadingPromise = new Promise((resolve, reject) => {
        if (window.google) {
            googleMapsInstance = window.google;
            resolve(googleMapsInstance);
            return;
        }

        // Check if API key is available
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            reject(new Error('Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.'));
            return;
        }

        console.log('Loading Google Maps...');

        // Create a global callback function
        const callbackName = 'googleMapsCallback';
        (window as unknown as { [key: string]: () => void })[callbackName] = () => {
            console.log('Google Maps loaded successfully');
            googleMapsInstance = window.google;
            resolve(googleMapsInstance);
        };

        // Create and load the script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
        script.async = true;
        script.defer = true;

        script.onerror = () => {
            console.error('Failed to load Google Maps');
            reject(new Error('Failed to load Google Maps'));
        };

        document.head.appendChild(script);
    });

    return loadingPromise;
};

export const searchNearbyBusinesses = async (
    center: { lat: number; lng: number },
    radius: number,
    businessTypes: string[],
    keyword?: string
): Promise<Business[]> => {
    await initializeGoogleMaps();

    if (businessTypes.length === 0) {
        return searchForAllTypes(center, radius, keyword);
    }

    const searchPromises = businessTypes.map(businessType =>
        searchForSingleType(center, radius, businessType, keyword)
    );

    try {
        const results = await Promise.all(searchPromises);
        const allBusinesses = results.flat();

        return allBusinesses.filter((business, index, self) =>
            index === self.findIndex(b => b.place_id === business.place_id)
        );
    } catch (error) {
        console.error('Error searching businesses:', error);
        throw error;
    }
};

export const searchBusinessesInCity = async (
    city: string,
    center: { lat: number; lng: number },
    businessTypes: string[],
    keyword?: string
): Promise<Business[]> => {
    await initializeGoogleMaps();

    const types = businessTypes.length > 0 ? businessTypes : [''];
    const searchPromises = types.map((businessType) =>
        searchCityText(city, center, businessType || undefined, keyword)
    );

    try {
        const results = await Promise.all(searchPromises);
        const allBusinesses = results.flat();

        return allBusinesses.filter((business, index, self) =>
            index === self.findIndex(b => b.place_id === business.place_id)
        );
    } catch (error) {
        console.error('Error searching city businesses:', error);
        throw error;
    }
};

export const searchBusinesses = async (options: {
    city: string;
    center: { lat: number; lng: number };
    radiusEnabled: boolean;
    radius: number;
    businessTypes: string[];
    keyword?: string;
}): Promise<Business[]> => {
    if (options.radiusEnabled) {
        return searchNearbyBusinesses(
            options.center,
            options.radius,
            options.businessTypes,
            options.keyword
        );
    }

    return searchBusinessesInCity(
        options.city,
        options.center,
        options.businessTypes,
        options.keyword
    );
};

const mapPlaceResult = (place: google.maps.places.PlaceResult): Business => ({
    id: place.place_id || Math.random().toString(),
    name: place.name || '',
    address: place.formatted_address || place.vicinity || '',
    rating: place.rating,
    user_ratings_total: place.user_ratings_total,
    price_level: place.price_level,
    types: place.types || [],
    geometry: {
        location: {
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
        },
    },
    photos: place.photos?.map(photo => ({
        photo_reference: (photo as ExtendedPlacePhoto).photo_reference || '',
        height: photo.height || 400,
        width: photo.width || 400,
    })),
    opening_hours: place.opening_hours ? {
        open_now: place.opening_hours.isOpen ? (place.opening_hours.isOpen() ?? false) : false,
        weekday_text: place.opening_hours.weekday_text || [],
    } : undefined,
    place_id: place.place_id || '',
});

const enrichBusinessDetails = (
    service: google.maps.places.PlacesService,
    businesses: Business[]
): Promise<Business[]> => {
    const detailedBusinesses = businesses.map(async (business) => {
        return new Promise<Business>((resolveDetail) => {
            const detailRequest: google.maps.places.PlaceDetailsRequest = {
                placeId: business.place_id,
                fields: ['formatted_phone_number', 'website', 'opening_hours'],
            };

            service.getDetails(detailRequest, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                    resolveDetail({
                        ...business,
                        phone: place.formatted_phone_number,
                        website: place.website,
                        opening_hours: place.opening_hours ? {
                            open_now: place.opening_hours.isOpen ? (place.opening_hours.isOpen() ?? false) : false,
                            weekday_text: place.opening_hours.weekday_text || [],
                        } : business.opening_hours,
                    });
                } else {
                    resolveDetail(business);
                }
            });
        });
    });

    return Promise.all(detailedBusinesses).catch((error) => {
        console.error('Error getting business details:', error);
        return businesses;
    });
};

const searchCityText = async (
    city: string,
    center: { lat: number; lng: number },
    businessType?: string,
    keyword?: string
): Promise<Business[]> => {
    const google = await initializeGoogleMaps();
    const service = new google.maps.places.PlacesService(document.createElement('div'));

    const typeLabel = businessType
        ? businessType.replace(/_/g, ' ')
        : 'businesses';
    const parts = [keyword, typeLabel, `in ${city}`].filter(Boolean);
    const query = parts.join(' ');

    return new Promise((resolve, reject) => {
        const request: google.maps.places.TextSearchRequest = {
            query,
            location: new google.maps.LatLng(center.lat, center.lng),
            type: businessType || undefined,
        };

        service.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                const businesses = results.map(mapPlaceResult);
                enrichBusinessDetails(service, businesses).then(resolve);
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                resolve([]);
            } else {
                reject(new Error(`City search failed with status: ${status}`));
            }
        });
    });
};

const searchForSingleType = async (
    center: { lat: number; lng: number },
    radius: number,
    businessType: string,
    keyword?: string
): Promise<Business[]> => {
    const google = await initializeGoogleMaps();

    const service = new google.maps.places.PlacesService(
        document.createElement('div')
    );

    return new Promise((resolve, reject) => {
        const request: google.maps.places.PlaceSearchRequest = {
            location: new google.maps.LatLng(center.lat, center.lng),
            radius: radius,
            type: businessType,
            keyword: keyword || undefined,
        };

        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                const businesses: Business[] = results.map((place) => ({
                    id: place.place_id || Math.random().toString(),
                    name: place.name || '',
                    address: place.vicinity || '',
                    rating: place.rating,
                    user_ratings_total: place.user_ratings_total,
                    price_level: place.price_level,
                    types: place.types || [],
                    geometry: {
                        location: {
                            lat: place.geometry?.location?.lat() || 0,
                            lng: place.geometry?.location?.lng() || 0,
                        },
                    },
                    photos: place.photos?.map(photo => ({
                        photo_reference: (photo as ExtendedPlacePhoto).photo_reference || '',
                        height: photo.height || 400,
                        width: photo.width || 400,
                    })),
                    opening_hours: place.opening_hours ? {
                        open_now: place.opening_hours.isOpen ? (place.opening_hours.isOpen() ?? false) : false,
                        weekday_text: place.opening_hours.weekday_text || [],
                    } : undefined,
                    place_id: place.place_id || '',
                }));

                // Get detailed information for each business
                const detailedBusinesses = businesses.map(async (business) => {
                    return new Promise<Business>((resolveDetail) => {
                        const detailRequest: google.maps.places.PlaceDetailsRequest = {
                            placeId: business.place_id,
                            fields: ['formatted_phone_number', 'website', 'opening_hours'],
                        };

                        service.getDetails(detailRequest, (place, status) => {
                            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                                resolveDetail({
                                    ...business,
                                    phone: place.formatted_phone_number,
                                    website: place.website,
                                    opening_hours: place.opening_hours ? {
                                        open_now: place.opening_hours.isOpen ? (place.opening_hours.isOpen() ?? false) : false,
                                        weekday_text: place.opening_hours.weekday_text || [],
                                    } : business.opening_hours,
                                });
                            } else {
                                resolveDetail(business);
                            }
                        });
                    });
                });

                Promise.all(detailedBusinesses).then(resolve).catch((error) => {
                    console.error('Error getting business details:', error);
                    resolve(businesses);
                });
            } else {
                resolve([]); // Return empty array instead of rejecting for individual type searches
            }
        });
    });
};

const searchForAllTypes = async (
    center: { lat: number; lng: number },
    radius: number,
    keyword?: string
): Promise<Business[]> => {
    const google = await initializeGoogleMaps();

    const service = new google.maps.places.PlacesService(
        document.createElement('div')
    );

    return new Promise((resolve, reject) => {
        const request: google.maps.places.PlaceSearchRequest = {
            location: new google.maps.LatLng(center.lat, center.lng),
            radius: radius,
            keyword: keyword || undefined,
        };

        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                const businesses: Business[] = results.map((place) => ({
                    id: place.place_id || Math.random().toString(),
                    name: place.name || '',
                    address: place.vicinity || '',
                    rating: place.rating,
                    user_ratings_total: place.user_ratings_total,
                    price_level: place.price_level,
                    types: place.types || [],
                    geometry: {
                        location: {
                            lat: place.geometry?.location?.lat() || 0,
                            lng: place.geometry?.location?.lng() || 0,
                        },
                    },
                    photos: place.photos?.map(photo => ({
                        photo_reference: (photo as ExtendedPlacePhoto).photo_reference || '',
                        height: photo.height || 400,
                        width: photo.width || 400,
                    })),
                    opening_hours: place.opening_hours ? {
                        open_now: place.opening_hours.isOpen ? (place.opening_hours.isOpen() ?? false) : false,
                        weekday_text: place.opening_hours.weekday_text || [],
                    } : undefined,
                    place_id: place.place_id || '',
                }));

                // Get detailed information for each business
                const detailedBusinesses = businesses.map(async (business) => {
                    return new Promise<Business>((resolveDetail) => {
                        const detailRequest: google.maps.places.PlaceDetailsRequest = {
                            placeId: business.place_id,
                            fields: ['formatted_phone_number', 'website', 'opening_hours'],
                        };

                        service.getDetails(detailRequest, (place, status) => {
                            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                                resolveDetail({
                                    ...business,
                                    phone: place.formatted_phone_number,
                                    website: place.website,
                                    opening_hours: place.opening_hours ? {
                                        open_now: place.opening_hours.isOpen ? (place.opening_hours.isOpen() ?? false) : false,
                                        weekday_text: place.opening_hours.weekday_text || [],
                                    } : business.opening_hours,
                                });
                            } else {
                                resolveDetail(business);
                            }
                        });
                    });
                });

                Promise.all(detailedBusinesses).then(resolve).catch((error) => {
                    console.error('Error getting business details:', error);
                    resolve(businesses);
                });
            } else {
                reject(new Error(`Places service failed with status: ${status}`));
            }
        });
    });
};

export interface CityLocation {
    name: string;
    lat: number;
    lng: number;
}

export const geocodeCity = async (cityQuery: string): Promise<CityLocation | null> => {
    const google = await initializeGoogleMaps();
    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve) => {
        geocoder.geocode({ address: cityQuery }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
                const result = results[0];
                const location = result.geometry.location;
                resolve({
                    name: result.formatted_address,
                    lat: location.lat(),
                    lng: location.lng(),
                });
            } else {
                resolve(null);
            }
        });
    });
};

export const getPlaceDetails = async (placeId: string): Promise<Business | null> => {
    const google = await initializeGoogleMaps();

    const service = new google.maps.places.PlacesService(
        document.createElement('div')
    );

    return new Promise((resolve, reject) => {
        const request: google.maps.places.PlaceDetailsRequest = {
            placeId: placeId,
            fields: [
                'name', 'formatted_address', 'formatted_phone_number', 'website',
                'rating', 'user_ratings_total', 'price_level', 'types', 'geometry',
                'photos', 'opening_hours', 'place_id'
            ],
        };

        service.getDetails(request, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                const business: Business = {
                    id: place.place_id || Math.random().toString(),
                    name: place.name || '',
                    address: place.formatted_address || '',
                    phone: place.formatted_phone_number,
                    website: place.website,
                    rating: place.rating,
                    user_ratings_total: place.user_ratings_total,
                    price_level: place.price_level,
                    types: place.types || [],
                    geometry: {
                        location: {
                            lat: place.geometry?.location?.lat() || 0,
                            lng: place.geometry?.location?.lng() || 0,
                        },
                    },
                    photos: place.photos?.map(photo => ({
                        photo_reference: (photo as ExtendedPlacePhoto).photo_reference || '',
                        height: photo.height || 400,
                        width: photo.width || 400,
                    })),
                    opening_hours: place.opening_hours ? {
                        open_now: place.opening_hours.isOpen ? (place.opening_hours.isOpen() ?? false) : false,
                        weekday_text: place.opening_hours.weekday_text || [],
                    } : undefined,
                    place_id: place.place_id || '',
                };
                resolve(business);
            } else {
                resolve(null);
            }
        });
    });
};
