export const calculateMagnitude = (uo, vo) => {
  return Math.sqrt(uo * uo + vo * vo);
};

export const getColorFromMagnitude = (magnitude) => {
  // Define thresholds for color mapping
  const maxMagnitude = 2.0; // Maximum expected current speed in m/s
  const normalizedMagnitude = Math.min(magnitude / maxMagnitude, 1);
  
  if (normalizedMagnitude <= 0.5) {
    // Green to Yellow gradient
    const hue = 120 - (normalizedMagnitude * 2 * 60);
    return `hsl(${hue}, 100%, 50%)`;
  } else {
    // Yellow to Red gradient
    const hue = 60 - ((normalizedMagnitude - 0.5) * 2 * 60);
    return `hsl(${hue}, 100%, 50%)`;
  }
};

export const subsampleData = (data, factor) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  
  // Take every nth point based on the factor
  return data.filter((_, index) => index % factor === 0);
};

export const processData = (rawData) => {
  const processedData = {};

  // Group data by date
  rawData.forEach(record => {
    const timeValue = record.time.value || record.time; // Handle both object and string formats
    const date = timeValue.split('T')[0]; // Extract date from timestamp
    if (!processedData[date]) {
      processedData[date] = [];
    }

    // Ensure all numeric values are properly parsed
    const latitude = parseFloat(record.latitude);
    const longitude = parseFloat(record.longitude);
    const uo = parseFloat(record.uo);
    const vo = parseFloat(record.vo);
    const depth = parseFloat(record.depth);

    // Only add the record if all values are valid numbers
    if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(uo) && !isNaN(vo) && !isNaN(depth)) {
      processedData[date].push({
        latitude,
        longitude,
        uo,
        vo,
        depth,
        time: timeValue
      });
    }
  });

  return processedData;
};