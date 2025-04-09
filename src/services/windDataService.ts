import { WindData } from '../types';
import { API_BASE_URL, API_ENDPOINTS, CACHE_CONFIG } from '../config';

// Cache object to store data and last fetch date
let dataCache = {
  data: null as WindData[] | null,
  lastFetchDate: null as string | null
};

export const fetchWindData = async () => {
  try {
    if (!CACHE_CONFIG.shouldRefreshCache(dataCache.lastFetchDate) && dataCache.data) {
      console.log('Returning cached wind data');
      return dataCache.data;
    }

    console.log('Fetching fresh wind data from server...');
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.WIND_DATA}`);
    
    if (!response.ok) {
      console.error('Wind data fetch failed:', response.status, response.statusText);
      throw new Error(`Failed to fetch wind data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Received wind data:', data.length, 'points');
    
    if (!data || data.length === 0) {
      console.warn('No wind data received from server');
    }
    
    // Update cache
    dataCache = {
      data: data,
      lastFetchDate: new Date().toISOString()
    };

    console.log('Fetched fresh wind data');
    return data;
  } catch (error) {
    console.error('Error fetching wind data:', error);
    throw error;
  }
};