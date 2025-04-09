import { OceanCurrentData, BiogeochemicalData, TemperatureData, ProcessedData, WindData } from '../types';
import { fetchWindData } from './windDataService';
import { API_BASE_URL, API_ENDPOINTS, CACHE_CONFIG } from '../config';

// Interface for alert image data
export interface AlertImageData {
  url: string;
  name: string;
}

// Cache object to store data and last fetch date
let dataCache = {
  data: null as ProcessedData | null,
  lastFetchDate: null as string | null
};

// Interface for tracking available dates per layer
export interface LayerDates {
  currents: Set<string>;
  oxygen: Set<string>;
  temperature: Set<string>;
  wind: Set<string>;
  pfz: Set<string>;
}

// Cache object to store layer-specific dates
let layerDatesCache: LayerDates = {
  currents: new Set(),
  oxygen: new Set(),
  temperature: new Set(),
  wind: new Set(),
  pfz: new Set()
};

const processData = (rawData: any[], type: 'currents' | 'oxygen' | 'temperature' | 'wind') => {
  const processedData: ProcessedData = {};

  rawData.forEach(record => {
    const timeValue = record.time.value || record.time;
    const date = timeValue.split('T')[0];
    
    // Track dates for this layer type
    layerDatesCache[type].add(date);
    
    if (!processedData[date]) {
      processedData[date] = {
        currents: [],
        oxygen: [],
        temperature: [],
        wind: []
      };
    }

    const latitude = parseFloat(record.latitude);
    const longitude = parseFloat(record.longitude);

    if (!isNaN(latitude) && !isNaN(longitude)) {
      const dataPoint = {
        latitude,
        longitude,
        time: timeValue,
        ...(type === 'currents' && {
          depth: parseFloat(record.depth),
          uo: parseFloat(record.uo),
          vo: parseFloat(record.vo)
        }),
        ...(type === 'oxygen' && {
          depth: parseFloat(record.depth),
          o2: parseFloat(record.o2),
          nppv: parseFloat(record.nppv)
        }),
        ...(type === 'temperature' && {
          depth: parseFloat(record.depth),
          thetao: parseFloat(record.thetao)
        }),
        ...(type === 'wind' && {
          eastward_wind: parseFloat(record.eastward_wind),
          northward_wind: parseFloat(record.northward_wind)
        })
      };

      processedData[date][type].push(dataPoint);
    }
  });

  return processedData;
};

export const fetchAlertImage = async (): Promise<AlertImageData> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ALERT_IMAGE}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch alert image');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching alert image:', error);
    throw error;
  }
};

export const fetchOceanData = async () => {
  try {
    if (!CACHE_CONFIG.shouldRefreshCache(dataCache.lastFetchDate) && dataCache.data) {
      console.log('Returning cached ocean data');
      return dataCache.data;
    }

    // Fetch all data layers in parallel
    const [currentsResponse, oxygenResponse, temperatureResponse, pfzResponse, windResponse] = await Promise.all([
      fetch(`${API_BASE_URL}${API_ENDPOINTS.OCEAN_CURRENTS}`),
      fetch(`${API_BASE_URL}${API_ENDPOINTS.OCEAN_OXYGEN}`),
      fetch(`${API_BASE_URL}${API_ENDPOINTS.OCEAN_TEMPERATURE}`),
      fetch(`${API_BASE_URL}${API_ENDPOINTS.PFZ}`),
      fetchWindData()
    ]);

    if (!currentsResponse.ok || !oxygenResponse.ok || !temperatureResponse.ok || !pfzResponse.ok) {
      throw new Error('Failed to fetch ocean data');
    }

    const [currentsData, oxygenData, temperatureData, pfzData, windData] = await Promise.all([
      currentsResponse.json(),
      oxygenResponse.json(),
      temperatureResponse.json(),
      pfzResponse.json(),
      windResponse
    ]);

    console.log('Raw wind data length:', windData.length);

    // Process each data layer
    const processedCurrents = processData(currentsData, 'currents');
    const processedOxygen = processData(oxygenData, 'oxygen');
    const processedTemperature = processData(temperatureData, 'temperature');
    const processedWind = processData(windData, 'wind');
    
    console.log('Processed wind data:', Object.keys(processedWind).map(date => ({
      date,
      count: processedWind[date].wind.length
    })));

    // Process PFZ data - no need for date processing as it doesn't have time data
    const processedPFZ = { today: { pfz: pfzData } };

    // Merge the processed data
    const mergedData: ProcessedData = {};
    const allDates = new Set([
      ...Object.keys(processedCurrents),
      ...Object.keys(processedOxygen),
      ...Object.keys(processedTemperature),
      ...Object.keys(processedPFZ),
      ...Object.keys(processedWind)
    ]);

    allDates.forEach(date => {
      mergedData[date] = {
        currents: processedCurrents[date]?.currents || [],
        oxygen: processedOxygen[date]?.oxygen || [],
        temperature: processedTemperature[date]?.temperature || [],
        pfz: processedPFZ[date]?.pfz || pfzData,
        wind: processedWind[date]?.wind || []
      };
    });

    // Update cache
    dataCache = {
      data: mergedData,
      lastFetchDate: new Date().toISOString()
    };

    // Update PFZ dates
    layerDatesCache.pfz = new Set(Object.keys(processedPFZ));

    console.log('Fetched fresh ocean data');
    return {
      data: mergedData,
      layerDates: {
        currents: Array.from(layerDatesCache.currents),
        oxygen: Array.from(layerDatesCache.oxygen),
        temperature: Array.from(layerDatesCache.temperature),
        wind: Array.from(layerDatesCache.wind),
        pfz: Array.from(layerDatesCache.pfz)
      }
    };
  } catch (error) {
    console.error('Error fetching ocean data:', error);
    throw error;
  }
};