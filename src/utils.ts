import { OceanCurrentData } from './types';

export const calculateMagnitude = (uo: number, vo: number): number => {
  return Math.sqrt(uo * uo + vo * vo);
};

export const getColorFromMagnitude = (magnitude: number): string => {
  // Adjusted thresholds for better color distribution
  if (magnitude < 0.1) return '#3498db'; // Light blue for very slow currents
  if (magnitude < 0.3) return '#2ecc71'; // Green for slow currents
  if (magnitude < 0.6) return '#f1c40f'; // Yellow for moderate currents
  return '#e74c3c'; // Red for strong currents
};

export const processData = (data: OceanCurrentData[]) => {
  const dateMap: { [key: string]: OceanCurrentData[] } = {};
  
  data.forEach(point => {
    // Skip invalid data points
    if (!point || typeof point.time !== 'string') {
      return;
    }

    const date = point.time.split('T')[0];
    if (!dateMap[date]) {
      dateMap[date] = [];
    }
    dateMap[date].push(point);
  });

  return dateMap;
};

export const subsampleData = (data: OceanCurrentData[], factor: number = 4): OceanCurrentData[] => {
  const result: OceanCurrentData[] = [];
  for (let i = 0; i < data.length; i += factor) {
    result.push(data[i]);
  }
  return result;
};