import React, { useEffect, useState } from 'react';
import { Marker, Circle } from '@react-google-maps/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface LiveLocationProps {
  map: google.maps.Map | null;
}

interface LocationState {
  position: google.maps.LatLngLiteral;
  accuracy: number;
}

const LiveLocation: React.FC<LiveLocationProps> = ({ map }) => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const { theme } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    // Start watching position
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          position: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          accuracy: position.coords.accuracy
        };

        setLocation(newLocation);

        // Pan map to new location if it exists
        if (map && newLocation.position) {
          map.panTo(newLocation.position);
        }
      },
      (err) => {
        setError(`Error getting location: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    setWatchId(id);

    // Cleanup function
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [map]);

  if (!location) {
    return null;
  }

  return (
    <>
      <Marker
        position={location.position}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: theme === 'dark' ? '#4CAF50' : '#2196F3',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
        }}
        title="Your Location"
      />
      <Circle
        center={location.position}
        radius={location.accuracy}
        options={{
          fillColor: theme === 'dark' ? '#4CAF50' : '#2196F3',
          fillOpacity: 0.15,
          strokeColor: theme === 'dark' ? '#4CAF50' : '#2196F3',
          strokeOpacity: 0.5,
          strokeWeight: 1,
        }}
      />
    </>
  );
};

export default LiveLocation;