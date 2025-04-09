# 🌊 Neptune: Your Advanced Fishing Assistant

Neptune is a sophisticated fishing assistance application designed to provide comprehensive ocean data visualization, real-time tracking, and predictive features for optimal fishing experiences. Similar to Fisher's Friend, Neptune combines multiple data sources to offer actionable insights for fishing enthusiasts.

## 🎯 Features

### 🌊 Multi-Layer Ocean Data Visualization
- Real-time ocean current visualization with direction and intensity
- Temperature mapping across different ocean depths
- Oxygen level monitoring for optimal fishing zones
- Wind pattern visualization with speed and direction indicators

### 📍 Real-Time GPS Tracking
- Live location tracking and navigation
- Integration with Google Maps for accurate positioning
- Custom route planning and waypoint marking

### ⚠️ Weather Alerts and Safety
- Real-time weather condition monitoring
- Storm and hazard alerts (For Tamil Nadu Region)
- Emergency notification system

### 🎣 Potential Fishing Zone (PFZ) Predictions
- AI-powered fishing zone predictions
- Historical catch data analysis
- Biogeochemical data integration

## 🚀 Tech Stack

### Frontend
- **Framework:** React with TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **UI Components:**
  - Custom components for data visualization
  - Responsive design with mobile-first approach
  - Dark/Light theme support
- **Maps Integration:** @react-google-maps/api
- **State Management:** React Context API
- **Internationalization:** Built-in language support

### Backend
- **Server:** Express.js
- **Database:** Google BigTable and Bigquery
- **Cloud Platform:** Google Cloud Platform
- **Authentication:** Firebase
- **API Integration:**
  - Ocean current data
  - Temperature data
  - Wind patterns
  - Potential Fishing Zone predictions

## 🛠️ Implementation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Platform account
- Firebase project setup

### Environment Setup
1. Clone the repository
2. Copy `.env.example` to `.env`
3. Configure the following environment variables:
   ```
    VITE_GEMINI_API_KEY=your-gemini-api-key
    VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

    VITE_FIREBASE_API_KEY=your-firebase-api-key
    VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
    VITE_FIREBASE_DATABASE_URL=your-firebase-database-url
    VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
    VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
    VITE_FIREBASE_APP_ID=your-firebase-app-id
   ```

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### Development

```bash
# Start frontend development server
npm run dev

# Start backend server
cd server
node index.js
```

### Production Build

```bash
# Build frontend
npm run build

# Start production server
cd server
npm start
```

## 🔒 Security

- Secure API key management
- Firebase Authentication integration
- Rate limiting on API endpoints
- Data encryption in transit

## 🌐 API Endpoints

- `/api/ocean-currents` - Fetch ocean current data
- `/api/ocean-oxygen` - Get oxygen level data
- `/api/ocean-temperature` - Retrieve temperature data
- `/api/pfz` - Access Potential Fishing Zone predictions
- `/api/wind-data` - Get wind pattern data
- `/api/alert-image` - Fetch weather alert images

## 📱 Mobile Responsiveness

Neptune is designed with a mobile-first approach, ensuring optimal performance and usability across all devices:
- Responsive layout adaptation
- Touch-friendly interface
- Offline capability for essential features
- Optimized data loading for mobile networks

## 🔄 Data Updates

- Real-time data updates for critical parameters
- Cached data management for optimal performance
- Configurable refresh intervals
- Fallback mechanisms for offline scenarios

## ⚠️ Disclaimer

The deployment of this project ([vectorinnovate.com](https://vectorinnovate.com)) has been performed through our **private repository**, which contains sensitive data such as:

- API keys  
- Security account token JSON files  
- Other confidential configurations  

As a result, we are unable to make that repository public. All commits and version history since the beginning of the project were maintained in the private repository.

This repository serves as the **public version of the project**, stripped of all sensitive information.  
You can still run the project locally by setting the necessary environment variables.

Please refer to the `.env.example` file to configure your local environment.


## 📈 Future Enhancements

- Machine learning integration for catch prediction and potential fishing zone
- Community features and social sharing
- Advanced route optimization
- Integration with fishing equipment IoT devices
- Enhanced user feedback and analytics
- Localization support for multiple languages
- Integration with external data sources
- User customization options and feedback system
- Integration with Live weather forecasting services

