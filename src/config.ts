// Configuration file for environment variables and API endpoints

// Load environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SERVICE_ACCOUNT_PATH = import.meta.env.VITE_SERVICE_ACCOUNT_PATH;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Validate required environment variables
if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not defined in environment variables');
}

if (!SERVICE_ACCOUNT_PATH) {
  throw new Error('VITE_SERVICE_ACCOUNT_PATH is not defined in environment variables');
}

if (!GEMINI_API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is not defined in environment variables');
}

if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('VITE_GOOGLE_MAPS_API_KEY is not defined in environment variables');
}

// Export validated environment variables
export { API_BASE_URL, SERVICE_ACCOUNT_PATH, GEMINI_API_KEY, GOOGLE_MAPS_API_KEY };

// API Endpoints
export const API_ENDPOINTS = {
  WIND_DATA: '/api/wind-data',
  OCEAN_CURRENTS: '/api/ocean-currents',
  OCEAN_OXYGEN: '/api/ocean-oxygen',
  OCEAN_TEMPERATURE: '/api/ocean-temperature',
  PFZ: '/api/pfz',
  ALERT_IMAGE: '/api/alert-image'
};

// Cache Configuration
export const CACHE_CONFIG = {
  // Function to check if cache needs refresh
  shouldRefreshCache: (lastFetchDate: string | null): boolean => {
    if (!lastFetchDate) return true;
    
    const currentDate = new Date().toISOString().split('T')[0];
    const lastFetchDateStr = new Date(lastFetchDate).toISOString().split('T')[0];
    
    return currentDate !== lastFetchDateStr;
  }
};