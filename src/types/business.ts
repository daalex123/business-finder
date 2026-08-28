export interface Business {
    id: string;
    name: string;
    address: string;
    phone?: string;
    website?: string;
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    types: string[];
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    photos?: Array<{
        photo_reference: string;
        height: number;
        width: number;
    }>;
    opening_hours?: {
        open_now: boolean;
        weekday_text: string[];
    };
    place_id: string;
}

export interface SearchFilters {
    city: string;
    businessTypes: string[];
    hasWebsite: boolean | null;
    keyword: string;
    radiusEnabled: boolean;
    radius: number;
    center: {
        lat: number;
        lng: number;
    };
}
