import React, { useEffect, useState } from 'react';
import { WindData } from '../types';
import { calculateMagnitude, getColorFromMagnitude } from '../utils';

interface WindLayerProps {
  data: WindData[];
  map: google.maps.Map;
  arrowSize?: number;
}

const WindLayer: React.FC<WindLayerProps> = ({ data, map, arrowSize = 0.5 }) => {
  const [arrows, setArrows] = useState<google.maps.Polyline[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);

  // Subsample data points based on zoom level
  const subsampleData = (data: WindData[], zoomLevel: number) => {
    // Fixed subsampling factor for 40% reduction
    const subsamplingFactor = 1.67;  // This will reduce points by ~40%

    // Create a grid to ensure even distribution
    const gridSize = 0.125 * subsamplingFactor; // Increased grid size for more reduction
    const grid: { [key: string]: WindData } = {};

    // Use modulo to skip points systematically
    let counter = 0;
    data.forEach(point => {
      counter++;
      if (counter % 2 === 0) { // Skip every other point
        const gridX = Math.floor(point.longitude / gridSize);
        const gridY = Math.floor(point.latitude / gridSize);
        const key = `${gridX},${gridY}`;
        
        if (!grid[key]) {
          grid[key] = point;
        }
      }
    });

    return Object.values(grid);
  };

  useEffect(() => {
    // Clear existing arrows
    arrows.forEach(arrow => arrow.setMap(null));
    if (infoWindow) infoWindow.close();

    const newInfoWindow = new google.maps.InfoWindow();
    setInfoWindow(newInfoWindow);

    if (!data || data.length === 0) {
      console.log('No wind data available');
      return;
    }

    // Get current zoom level and subsample data
    const zoomLevel = map.getZoom();
    const subsampledData = subsampleData(data, zoomLevel);
    console.log(`Subsampled wind data from ${data.length} to ${subsampledData.length} points`);

    // Calculate max magnitude for scaling
    const maxMagnitude = Math.max(...subsampledData.map(point => 
      calculateMagnitude(point.eastward_wind, point.northward_wind)
    ));

    // Scale factor to convert wind speed to degrees (for arrow length)
    const scaleFactor = 0.05;

    const newArrows = subsampledData.map(point => {
      const magnitude = calculateMagnitude(point.eastward_wind, point.northward_wind);
      const color = getColorFromMagnitude(magnitude / maxMagnitude * 2);

      // Calculate arrow points
      const start = new google.maps.LatLng(point.latitude, point.longitude);
      
      // Calculate normalized vector components
      const totalMagnitude = Math.sqrt(point.eastward_wind * point.eastward_wind + point.northward_wind * point.northward_wind);
      const normalizedEastward = totalMagnitude > 0 ? point.eastward_wind / totalMagnitude : 0;
      const normalizedNorthward = totalMagnitude > 0 ? point.northward_wind / totalMagnitude : 0;

      // Calculate end point using scaled magnitude
      const arrowLength = magnitude * scaleFactor;
      const endLat = point.latitude + (normalizedNorthward * arrowLength);
      const endLng = point.longitude + (normalizedEastward * arrowLength);
      const end = new google.maps.LatLng(endLat, endLng);

      // Create arrow shaft
      const arrow = new google.maps.Polyline({
        path: [start, end],
        strokeColor: color,
        strokeWeight: 1.5,
        strokeOpacity: 0.8,
        map: map,
        icons: [{
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 2,
          },
          offset: '100%'
        }]
      });

      // Add click listener for info window
      arrow.addListener('click', (event: google.maps.MapMouseEvent) => {
        const content = `
          <div class="p-2">
            <p><strong>Coordinates:</strong> ${point.latitude.toFixed(4)}°, ${point.longitude.toFixed(4)}°</p>
            <p><strong>Eastward Wind:</strong> ${point.eastward_wind.toFixed(2)} m/s</p>
            <p><strong>Northward Wind:</strong> ${point.northward_wind.toFixed(2)} m/s</p>
            <p><strong>Wind Speed:</strong> ${magnitude.toFixed(2)} m/s</p>
          </div>
        `;
        newInfoWindow.setContent(content);
        newInfoWindow.setPosition(event.latLng);
        newInfoWindow.open(map);
      });

      return arrow;
    });

    console.log('Created wind arrows:', newArrows.length);
    setArrows(newArrows);

    // Add zoom change listener to update subsampling
    const zoomListener = map.addListener('zoom_changed', () => {
      const newZoom = map.getZoom();
      const newSubsampledData = subsampleData(data, newZoom);
      // Re-render arrows with new subsampled data
      arrows.forEach(arrow => arrow.setMap(null));
      setArrows([]);
      // This will trigger a re-render with the new subsampled data
    });

    return () => {
      newArrows.forEach(arrow => arrow.setMap(null));
      if (newInfoWindow) newInfoWindow.close();
      google.maps.event.removeListener(zoomListener);
    };
  }, [data, map, arrowSize]);

  return null;
};

export default WindLayer; 