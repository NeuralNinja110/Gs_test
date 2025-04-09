import { API_BASE_URL, API_ENDPOINTS, CACHE_CONFIG } from '../config';

// Cache object to store data and last fetch date
let dataCache = {
  data: null,
  lastFetchDate: null
};

export const fetchOceanCurrentData = async () => {
  try {
    // Return cached data if it's from today
    if (!CACHE_CONFIG.shouldRefreshCache(dataCache.lastFetchDate) && dataCache.data) {
      console.log('Returning cached ocean current data');
      return dataCache.data;
    }

    // Fetch new data if cache is outdated or empty
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.OCEAN_CURRENTS}`);
    if (!response.ok) {
      throw new Error('Failed to fetch ocean current data');
    }
    const data = await response.json();
    
    // Update cache with new data
    dataCache = {
      data: data,
      lastFetchDate: new Date().toISOString()
    };
    
    console.log('Fetched fresh ocean current data');
    return data;
  } catch (error) {
    console.error('Error fetching ocean current data:', error);
    throw error;
  }
};