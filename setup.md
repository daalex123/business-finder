# Setup Instructions

## Environment Variables

Create a `.env.local` file in the root directory with the following content:

```env
# Google Maps API Key
# Get your API key from: https://console.cloud.google.com/
# Make sure to enable Maps JavaScript API and Places API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Getting Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
4. Go to "Credentials" and create an API Key
5. Restrict the API key to your domain for security
6. Copy the API key and add it to your `.env.local` file

## Running the Application

1. Install dependencies: `npm install`
2. Create `.env.local` with your API key
3. Run development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Features

- Interactive Google Maps with click-to-search
- Business type filtering (100+ categories)
- Website availability filtering
- Keyword search
- Radius adjustment (100m - 5km)
- CSV export functionality
- Reddit business solutions search
- Responsive design for mobile and desktop
