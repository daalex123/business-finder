export const config = {
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    redditApiUrl: 'https://www.reddit.com/r',

    businessTypes: [
        'restaurant', 'cafe', 'bar', 'hotel', 'gas_station', 'pharmacy', 'hospital',
        'bank', 'atm', 'post_office', 'police', 'fire_station', 'school', 'university',
        'gym', 'spa', 'beauty_salon', 'hair_care', 'clothing_store', 'electronics_store',
        'furniture_store', 'home_goods_store', 'jewelry_store', 'shoe_store', 'book_store',
        'bicycle_store', 'car_dealer', 'car_rental', 'car_repair', 'car_wash', 'parking',
        'real_estate_agency', 'insurance_agency', 'accounting', 'lawyer', 'dentist',
        'veterinary_care', 'pet_store', 'florist', 'funeral_home', 'cemetery', 'church',
        'mosque', 'synagogue', 'hindu_temple', 'tourist_attraction', 'museum', 'zoo',
        'aquarium', 'amusement_park', 'bowling_alley', 'movie_theater', 'night_club',
        'casino', 'shopping_mall', 'supermarket', 'grocery_or_supermarket', 'convenience_store',
        'liquor_store', 'bakery', 'butcher', 'seafood', 'meal_takeaway', 'meal_delivery',
        'food', 'store', 'laundry', 'dry_cleaning', 'locksmith', 'moving_company',
        'plumber', 'electrician', 'painter', 'roofing_contractor', 'general_contractor',
        'hardware_store', 'lumber_yard', 'garden_center', 'nursery', 'storage', 'rv_park',
        'campground', 'rv_dealer', 'boat_dealer', 'marina', 'airport', 'bus_station',
        'subway_station', 'train_station', 'taxi_stand', 'travel_agency', 'tourist_office'
    ],

    redditSubreddits: [
        'entrepreneur', 'smallbusiness', 'startups', 'business', 'marketing',
        'sales', 'ecommerce', 'freelance', 'consulting', 'investing',
        'personalfinance', 'FIRE', 'sidehustle', 'passive_income', 'digitalnomad'
    ],

    searchRadius: {
        min: 100,
        max: 5000,
        default: 1000,
        step: 100
    }
};
