import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { calculateMagnitude, getColorFromMagnitude, subsampleData } from '../utils';
import NavigationSystem from './NavigationSystem';
import { useTheme } from '../context/ThemeContext';
import WindLayer from './WindLayer';
import Legend from './Legend';
import LiveLocation from './LiveLocation';

const libraries = ["visualization", "geometry"];


const ArrowLayer = ({ data, arrowSize, map }) => {
  const [arrows, setArrows] = useState([]);
  const [infoWindow, setInfoWindow] = useState(null);
  
  useEffect(() => {
    arrows.forEach(arrow => arrow.setMap(null));
    if (infoWindow) infoWindow.close();
    
    const newInfoWindow = new google.maps.InfoWindow();
    setInfoWindow(newInfoWindow);
    
    const subsampledData = subsampleData(data, 8);
    
    const ARROW_LENGTH = 0.5 * arrowSize;
    const HEAD_LENGTH = 0.15 * arrowSize;
    const HEAD_ANGLE = Math.PI / 6;
    
    const newArrows = subsampledData.map(point => {
      const magnitude = calculateMagnitude(point.uo, point.vo);
      const color = getColorFromMagnitude(magnitude);
      
      const angle = Math.atan2(point.vo, point.uo);
      
      const startPoint = { lat: point.latitude, lng: point.longitude };
      const endPoint = {
        lat: point.latitude + Math.sin(angle) * ARROW_LENGTH,
        lng: point.longitude + Math.cos(angle) * ARROW_LENGTH
      };
      
      const arrow = new google.maps.Polyline({
        path: [startPoint, endPoint],
        map,
        strokeColor: color,
        strokeWeight: 1.5
      });
      
      arrow.addListener('mouseover', () => {
        const degrees = (angle * 180 / Math.PI).toFixed(1);
        const cardinalDirection = getCardinalDirection(parseFloat(degrees));
        const content = `
          <div class="p-2">
            <p><strong>Coordinates:</strong> ${point.latitude.toFixed(4)}°, ${point.longitude.toFixed(4)}°</p>
            <p><strong>Current Speed:</strong> ${magnitude.toFixed(2)} m/s</p>
            <p><strong>Direction:</strong> ${degrees}° (${cardinalDirection})</p>
          </div>
        `;
        newInfoWindow.setContent(content);
        newInfoWindow.setPosition(startPoint);
        newInfoWindow.open(map);
      });

      function getCardinalDirection(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(((degrees + 360) % 360) / 22.5) % 16;
        return directions[index];
      }
      
      arrow.addListener('mouseout', () => {
        newInfoWindow.close();
      });
      
      const headPoint1 = {
        lat: endPoint.lat - Math.sin(angle + HEAD_ANGLE) * HEAD_LENGTH,
        lng: endPoint.lng - Math.cos(angle + HEAD_ANGLE) * HEAD_LENGTH
      };
      
      const headPoint2 = {
        lat: endPoint.lat - Math.sin(angle - HEAD_ANGLE) * HEAD_LENGTH,
        lng: endPoint.lng - Math.cos(angle - HEAD_ANGLE) * HEAD_LENGTH
      };
      
      const arrowHead = new google.maps.Polygon({
        paths: [endPoint, headPoint1, headPoint2],
        map,
        strokeColor: color,
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 1
      });
      
      return [arrow, arrowHead];
    }).flat();
    
    setArrows(newArrows);
    
    return () => {
      newArrows.forEach(arrow => arrow.setMap(null));
      newInfoWindow.close();
    };
  }, [data, arrowSize, map]);
  
  return null;
};

const HeatmapLayer = ({ data, map, type }) => {
  const [heatmap, setHeatmap] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);

  useEffect(() => {
    if (heatmap) {
      heatmap.setMap(null);
    }
    if (infoWindow) {
      infoWindow.close();
    }

    const newInfoWindow = new google.maps.InfoWindow();
    setInfoWindow(newInfoWindow);

    // Adjust subsampling based on data density
    const subsampledData = subsampleData(data, 2);
    
    // Normalize the data values
    const values = subsampledData.map(point => 
      type === 'oxygen' ? point.o2 : point.thetao
    );
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    const heatmapData = subsampledData.map(point => {
      const value = type === 'oxygen' ? point.o2 : point.thetao;
      // Normalize the value between 0 and 1
      const normalizedValue = (value - minValue) / (maxValue - minValue);
      
      return {
        location: new google.maps.LatLng(point.latitude, point.longitude),
        weight: normalizedValue,
        value: value // Keep original value for info window
      };
    });

    const newHeatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: map,
      radius: 25, // Increased base radius
      opacity: 0.8,
      dissipating: true,
      maxIntensity: type === 'oxygen' ? 0.8 : 0.6, // Adjusted intensity for temperature
      gradient: type === 'oxygen' 
        ? [
            'rgba(0, 0, 139, 0)',    // dark blue
            'rgba(0, 0, 255, 0.3)',  // blue
            'rgba(0, 128, 255, 0.5)', // light blue
            'rgba(0, 255, 255, 0.7)', // cyan
            'rgba(0, 255, 128, 0.8)', // blue-green
            'rgba(0, 255, 0, 1)'      // green
          ]
        : [
            'rgba(0, 0, 255, 0)',     // blue (cold)
            'rgba(0, 255, 255, 0.4)', // cyan
            'rgba(0, 255, 0, 0.6)',   // green
            'rgba(255, 255, 0, 0.7)', // yellow
            'rgba(255, 128, 0, 0.85)', // orange
            'rgba(255, 0, 0, 1)'      // red (hot)
          ]
    });

    // Dynamic radius adjustment based on zoom level
    const updateRadius = () => {
      const zoom = map.getZoom();
      let newRadius;
      
      // Exponential scaling based on zoom level
      if (zoom <= 4) {
        newRadius = 25; // Base radius at low zoom
      } else if (zoom <= 6) {
        newRadius = 20;
      } else if (zoom <= 8) {
        newRadius = 35;
      } else if (zoom <= 10) {
        newRadius = 45;
      } else {
        newRadius = 60; // Larger radius at high zoom for better coverage
      }

      // Adjust opacity based on zoom to maintain visual consistency
      const newOpacity = Math.min(0.8, 0.6 + (zoom - 4) * 0.05);
      
      newHeatmap.set('radius', newRadius);
      newHeatmap.set('opacity', newOpacity);
    };

    // Initial radius setup
    updateRadius();

    // Add zoom change listener
    const zoomListener = map.addListener('zoom_changed', updateRadius);

    // Add click listener for info window
    map.addListener('click', (event) => {
      const clickedLat = event.latLng.lat();
      const clickedLng = event.latLng.lng();
      
      const nearestPoint = subsampledData.reduce((nearest, point) => {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          event.latLng,
          new google.maps.LatLng(point.latitude, point.longitude)
        );
        return distance < nearest.distance ? { point, distance } : nearest;
      }, { point: null, distance: Infinity });

      if (nearestPoint.point && nearestPoint.distance < 10000) {
        const value = type === 'oxygen' ? nearestPoint.point.o2 : nearestPoint.point.thetao;
        const unit = type === 'oxygen' ? 'mmol/m³' : '°C';
        const content = `
          <div class="p-2">
            <p><strong>Coordinates:</strong> ${nearestPoint.point.latitude.toFixed(4)}°, ${nearestPoint.point.longitude.toFixed(4)}°</p>
            <p><strong>${type === 'oxygen' ? 'Oxygen' : 'Temperature'}:</strong> ${value.toFixed(2)} ${unit}</p>
            <p><strong>Range:</strong> ${minValue.toFixed(2)} - ${maxValue.toFixed(2)} ${unit}</p>
          </div>
        `;
        newInfoWindow.setContent(content);
        newInfoWindow.setPosition(event.latLng);
        newInfoWindow.open(map);
      }
    });

    setHeatmap(newHeatmap);
    setInfoWindow(newInfoWindow);

    return () => {
      if (newHeatmap) {
        newHeatmap.setMap(null);
      }
      if (infoWindow) {
        infoWindow.close();
      }
      google.maps.event.removeListener(zoomListener);
    };
  }, [data, map, type]);

  return null;
};

const PFZLayer = ({ pfzData, map }) => {
  const [pfzLines, setPfzLines] = useState([]);
  const [infoWindow, setInfoWindow] = useState(null);

  useEffect(() => {
    pfzLines.forEach(line => line.setMap(null));
    if (infoWindow) infoWindow.close();

    const newInfoWindow = new google.maps.InfoWindow();
    setInfoWindow(newInfoWindow);

    if (!pfzData) return;

    const newPfzLines = pfzData.map(pfz => {
      const line = new google.maps.Polyline({
        path: [
          { lat: pfz.coordinates.start.latitude, lng: pfz.coordinates.start.longitude },
          { lat: pfz.coordinates.end.latitude, lng: pfz.coordinates.end.longitude }
        ],
        map,
        strokeColor: '#000000',
        strokeWeight: 2,
        strokeOpacity: 0.8
      });

      line.addListener('mouseover', () => {
        const content = `
          <div class="p-2">
            <p><strong>PFZ Line</strong></p>
            ${pfz.name ? `<p><strong>Name:</strong> ${pfz.name}</p>` : ''}
            ${pfz.description ? `<p><strong>Description:</strong> ${pfz.description}</p>` : ''}
            <p><strong>Start:</strong> ${pfz.coordinates.start.latitude.toFixed(4)}°, ${pfz.coordinates.start.longitude.toFixed(4)}°</p>
            <p><strong>End:</strong> ${pfz.coordinates.end.latitude.toFixed(4)}°, ${pfz.coordinates.end.longitude.toFixed(4)}°</p>
          </div>
        `;
        newInfoWindow.setContent(content);
        newInfoWindow.setPosition({
          lat: (pfz.coordinates.start.latitude + pfz.coordinates.end.latitude) / 2,
          lng: (pfz.coordinates.start.longitude + pfz.coordinates.end.longitude) / 2
        });
        newInfoWindow.open(map);
      });

      line.addListener('mouseout', () => {
        newInfoWindow.close();
      });

      return line;
    });

    setPfzLines(newPfzLines);

    return () => {
      newPfzLines.forEach(line => line.setMap(null));
      newInfoWindow.close();
    };
  }, [pfzData, map]);

  return null;
};

const Map = ({ data, selectedLayer, pfzData }) => {
  const [arrowSize, setArrowSize] = useState(1.0);
  const [map, setMap] = useState(null);
  const { theme } = useTheme();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  // Define map styles based on theme
  const lightModeStyles = [
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#ffffff' }, { lightness: 17 }, { weight: 0.2 }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [{ color: '#ffffff' }, { lightness: 17 }]
    },
    {
      featureType: 'road.local',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }, { lightness: 16 }]
    },
    {
      featureType: 'road.local',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#ffffff' }, { lightness: 17 }, { weight: 0.2 }]
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }, { lightness: 21 }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#dedede' }, { lightness: 21 }]
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { lightness: 16 }]
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#333333' }, { lightness: 16 }]
    },
    {
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#f2f2f2' }, { lightness: 19 }]
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#bdbdbd' }, { lightness: 17 }, { weight: 1.2 }]
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.fill',
      stylers: [{ color: '#ffffff' }, { lightness: 20 }]
    }
  ];
  
  const darkModeStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ];

  const onLoad = useCallback((map) => {
    setMap(map);
    // Initial map setup only
  }, []);
  
  // Update map styles when theme changes
  useEffect(() => {
    if (!map) return;
    const lightModeStyles = [
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#ffffff' }, { lightness: 17 }, { weight: 0.2 }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.fill',
          stylers: [{ color: '#ffffff' }, { lightness: 17 }]
        },
        {
          featureType: 'road.local',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }, { lightness: 16 }]
        },
        {
          featureType: 'road.local',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#ffffff' }, { lightness: 17 }, { weight: 0.2 }]
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }, { lightness: 21 }]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#dedede' }, { lightness: 21 }]
        },
        {
          elementType: 'labels.text.stroke',
          stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { lightness: 16 }]
        },
        {
          elementType: 'labels.text.fill',
          stylers: [{ color: '#333333' }, { lightness: 16 }]
        },
        {
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{ color: '#f2f2f2' }, { lightness: 19 }]
        },
        {
          featureType: 'administrative',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#bdbdbd' }, { lightness: 17 }, { weight: 1.2 }]
        },
        {
          featureType: 'administrative',
          elementType: 'geometry.fill',
          stylers: [{ color: '#ffffff' }, { lightness: 20 }]
        }
      ];
    
    const darkModeStyles = [
      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
      },
      {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
      },
      {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
      },
      {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
      },
      {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
      },
    ];
    
    map.setOptions({
      mapTypeId: 'terrain',
      styles: theme === 'dark' ? darkModeStyles : lightModeStyles
    });
  }, [theme]);

  if (loadError) {
    return <div>Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`flex flex-col gap-4 ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <GoogleMap
        center={{ lat: 20.5937, lng: 78.9629 }}
        zoom={5}
        mapContainerStyle={{ height: '600px', width: '100%', position: 'relative' }}
        onLoad={onLoad}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          gestureHandling: 'greedy'
        }}
      >
        {map && selectedLayer === 'currents' && (
          <>
            <ArrowLayer data={data.currents} arrowSize={arrowSize} map={map} />
            <NavigationSystem data={data.currents} map={map} />
          </>
        )}
        {map && selectedLayer === 'oxygen' && (
          <HeatmapLayer data={data.oxygen} map={map} type="oxygen" />
        )}
        {map && selectedLayer === 'temperature' && (
          <HeatmapLayer data={data.temperature} map={map} type="temperature" />
        )}
        {map && selectedLayer === 'pfz' && pfzData && (
          <PFZLayer pfzData={pfzData} map={map} />
        )}
        {map && selectedLayer === 'wind' && data.wind && (
          <WindLayer data={data.wind} map={map} arrowSize={arrowSize} />
        )}
        {map && <NavigationSystem data={data.currents} map={map} />}
        {map && <LiveLocation map={map} />}
        <Legend selectedLayer={selectedLayer} />
      </GoogleMap>
    </div>
  );
};

export default Map;
