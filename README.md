# Business Finder - Web Application #

A comprehensive Next.js web application that helps you find businesses in any area using Google Maps API and discover business solutions through Reddit community insights.

## 🚀 Features

### Google Maps Search
- 🗺️ **Interactive Map**: Click anywhere on the map to set the search center
- 📍 **Radius Selection**: Adjustable search radius from 100m to 5km
- 🏢 **Business Type Filter**: Search by specific business categories (100+ types)
- 🌐 **Website Filter**: Find businesses with or without websites
- 🔍 **Keyword Search**: Search for specific terms like "pizza", "coffee", etc.
- 📊 **Detailed Information**: View business details including ratings, reviews, contact info
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 📄 **CSV Export**: Export business data for further analysis

### Reddit Business Solutions Search
- 🔍 **Reddit Search**: Search Reddit for business solutions, tools, and automation
- 📚 **Business Subreddits**: Access to 15+ popular business-related subreddits
- 🛠️ **Tool Recommendations**: Find automation tools, website builders, and SaaS solutions
- 💡 **Community Insights**: Get real-world advice from entrepreneurs and business owners
- 📈 **Trending Topics**: Discover popular business discussions and solutions
- 🔗 **Direct Links**: Click through to Reddit posts for detailed discussions

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Google Maps JavaScript API
- **Data Export**: PapaParse (CSV)
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 📋 Prerequisites

- Node.js 18+ and npm
- Google Maps API key with Places API enabled
- Modern web browser

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd b_finder
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 4. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 5. Run the Development Server
```bash

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage

### Map Search
1. **Set Location**: Click anywhere on the map to set the search center
2. **Adjust Radius**: Use the slider to set search radius (100m - 5km)
3. **Filter by Type**: Select a business type from the dropdown
4. **Add Keywords**: Enter specific terms like "24/7", "delivery", etc.
5. **Website Filter**: Choose to show only businesses with/without websites
6. **Search**: Click "Search Businesses" to find results
7. **Export**: Download results as CSV for analysis

### Reddit Solutions
1. **Search**: Enter keywords related to business solutions
2. **Filter by Subreddit**: Choose specific business subreddits
3. **Browse Trending**: View popular business topics
4. **Read Posts**: Click through to Reddit for detailed discussions

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── Map.tsx           # Google Maps component
│   ├── SearchFilters.tsx # Search filters UI
│   ├── BusinessList.tsx  # Business results display
│   └── RedditSearch.tsx  # Reddit search interface
├── lib/                   # Utility libraries
│   ├── config.ts         # App configuration
│   ├── google-maps.ts    # Google Maps API integration
│   └── reddit.ts         # Reddit API integration
└── types/                 # TypeScript type definitions
    └── business.ts       # Business and search types
```

## 🔧 Configuration

### Business Types
The app includes 100+ business types including:
- Restaurants, cafes, bars
- Hotels, gas stations, pharmacies
- Banks, ATMs, post offices
- Gyms, spas, beauty salons
- And many more...

### Reddit Subreddits
Pre-configured business subreddits:
- r/entrepreneur
- r/smallbusiness
- r/startups
- r/business
- r/marketing
- And 10+ more...

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🔒 Security Notes

- Restrict your Google Maps API key to specific domains
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Consider implementing rate limiting for production use

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your Google Maps API key is correct
3. Ensure all required APIs are enabled
4. Check your internet connection

## 🔮 Future Enhancements

- [ ] User authentication and saved searches
- [ ] Advanced filtering options (price range, ratings)
- [ ] Business comparison features
- [ ] Integration with more data sources
- [ ] Mobile app version
- [ ] Real-time business status updates
- [ ] Social sharing features
- [ ] Business review aggregation

---

**Built with ❤️ using Next.js and Google Maps API**