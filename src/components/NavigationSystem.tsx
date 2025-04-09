import React, { useState, useEffect } from 'react';
import { Marker } from '@react-google-maps/api';
import { OceanCurrentData } from '../types';
import { calculateMagnitude } from '../utils';
import { useTheme } from '../context/ThemeContext';

interface NavigationSystemProps {
  data: OceanCurrentData[];
  map: google.maps.Map;
}

interface Point {
  lat: number;
  lng: number;
}

interface PathNode {
  point: Point;
  g: number; // Cost from start
  h: number; // Heuristic cost to end
  f: number; // Total cost (g + h)
  parent: PathNode | null;
  currentStrength: number;
  currentDirection: number;
}

const NavigationSystem: React.FC<NavigationSystemProps> = ({ data, map }) => {
  const [startMarker, setStartMarker] = useState<Point | null>(null);
  const [endMarker, setEndMarker] = useState<Point | null>(null);
  const [path, setPath] = useState<google.maps.Polyline | null>(null);
  const [isSettingStart, setIsSettingStart] = useState(true);
  const [isSelectingPoint, setIsSelectingPoint] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!isSelectingPoint) return;

      // Clear existing path when setting new points
      if (path) {
        path.setMap(null);
        setPath(null);
      }

      const clickedPoint = {
        lat: e.latLng?.lat() || 0,
        lng: e.latLng?.lng() || 0
      };

      if (isSettingStart) {
        setStartMarker(clickedPoint);
        setIsSettingStart(false);
      } else {
        setEndMarker(clickedPoint);
        setIsSettingStart(true);
      }
      setIsSelectingPoint(false);
    });

    return () => {
      google.maps.event.removeListener(clickListener);
    };
  }, [map, isSettingStart, isSelectingPoint, path]);

  // Effect to update path when markers change
  useEffect(() => {
    if (startMarker && endMarker) {
      // Clear existing path
      if (path) {
        path.setMap(null);
      }

      // Find optimal path considering ocean currents
      const pathPoints = findPath(startMarker, endMarker, data);

      // Create new path
      const newPath = new google.maps.Polyline({
        path: pathPoints,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      newPath.setMap(map);
      setPath(newPath);
    }
  }, [startMarker, endMarker, map, data]);

  const handleSetStart = () => {
    setIsSettingStart(true);
    setIsSelectingPoint(true);
  };

  const handleSetEnd = () => {
    setIsSettingStart(false);
    setIsSelectingPoint(true);
  };

  const handleClear = () => {
    setStartMarker(null);
    setEndMarker(null);
    if (path) {
      path.setMap(null);
      setPath(null);
    }
  };

  return (
    <>
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <button
          onClick={handleSetStart}
          className={`px-4 py-2 rounded ${isSelectingPoint && isSettingStart ? 'bg-blue-600' : 'bg-blue-500'} text-white hover:bg-blue-600 transition-colors ${theme === 'dark' ? 'shadow-dark' : 'shadow-light'}`}
          disabled={isSelectingPoint && !isSettingStart}
        >
          Set Start Point
        </button>
        <button
          onClick={handleSetEnd}
          className={`px-4 py-2 rounded ${isSelectingPoint && !isSettingStart ? 'bg-blue-600' : 'bg-blue-500'} text-white hover:bg-blue-600 transition-colors ${theme === 'dark' ? 'shadow-dark' : 'shadow-light'}`}
          disabled={isSelectingPoint && isSettingStart}
        >
          Set End Point
        </button>
        <button
          onClick={handleClear}
          className={`px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors ${theme === 'dark' ? 'shadow-dark' : 'shadow-light'}`}
        >
          Clear Navigation
        </button>
      </div>
      {startMarker && (
        <Marker
          position={startMarker}
          label={{ text: "S", color: "white" }}
          title="Start Point"
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: theme === 'dark' ? '#60a5fa' : '#3b82f6',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: theme === 'dark' ? '#f9fafb' : '#ffffff',
            scale: 8
          }}
        />
      )}
      {endMarker && (
        <Marker
          position={endMarker}
          label={{ text: "E", color: "white" }}
          title="End Point"
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: theme === 'dark' ? '#f87171' : '#ef4444',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: theme === 'dark' ? '#f9fafb' : '#ffffff',
            scale: 8
          }}
        />
      )}
    </>
  );
};

export default NavigationSystem;

const findPath = (start: Point, end: Point, data: OceanCurrentData[]): Point[] => {
  const gridSize = 0.2; // Reduced grid size for finer path resolution
  const maxIterations = 2000; // Increased max iterations for more thorough search
  
  const getNeighbors = (point: Point): Point[] => {
    const neighbors: Point[] = [];
    // Add more directional options (8 directions)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        neighbors.push({
          lat: point.lat + dy * gridSize,
          lng: point.lng + dx * gridSize
        });
      }
    }
    return neighbors;
  };

  const getClosestDataPoint = (point: Point): OceanCurrentData | null => {
    let closest: OceanCurrentData | null = null;
    let minDist = Infinity;

    for (const dataPoint of data) {
      const dist = Math.sqrt(
        Math.pow(dataPoint.latitude - point.lat, 2) +
        Math.pow(dataPoint.longitude - point.lng, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        closest = dataPoint;
      }
    }

    return closest;
  };

  const heuristic = (a: Point, b: Point): number => {
    return Math.sqrt(
      Math.pow(b.lat - a.lat, 2) +
      Math.pow(b.lng - a.lng, 2)
    ) * 100; // Scale factor for better comparison with current costs
  };

  const calculateCurrentCost = (from: Point, to: Point, current: OceanCurrentData): number => {
    const movement = {
      lat: to.lat - from.lat,
      lng: to.lng - from.lng
    };
    const movementAngle = Math.atan2(movement.lat, movement.lng);
    const currentAngle = Math.atan2(current.vo, current.uo);
    const angleDiff = Math.abs(movementAngle - currentAngle);
    const currentStrength = calculateMagnitude(current.uo, current.vo);
    
    // Base distance cost - increased weight for more direct paths
    const distanceCost = Math.sqrt(Math.pow(movement.lat, 2) + Math.pow(movement.lng, 2)) * 150;
    
    // Calculate current alignment factor (-1 to 1, where 1 is perfect alignment)
    const alignmentFactor = Math.cos(angleDiff);
    
    // Reduced impact of currents on path selection
    let currentPenalty = 0;
    if (alignmentFactor < 0) {
      // Reduced penalty for opposing currents
      currentPenalty = currentStrength * Math.abs(alignmentFactor) * 50;
    } else {
      // Smaller bonus for favorable currents
      currentPenalty = -currentStrength * alignmentFactor * 30;
    }
    
    return distanceCost + currentPenalty;
  };

  const openSet = new Set<string>();
  const closedSet = new Set<string>();
  const cameFrom = new Map<string, Point>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  const pointToKey = (p: Point): string => `${p.lat},${p.lng}`;
  const startKey = pointToKey(start);
  
  openSet.add(startKey);
  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(start, end));

  let iterations = 0;
  while (openSet.size > 0 && iterations < maxIterations) {
    iterations++;
    
    // Find point with lowest fScore
    let current = start;
    let currentKey = startKey;
    let lowestF = Infinity;
    
    for (const key of openSet) {
      const f = fScore.get(key) || Infinity;
      if (f < lowestF) {
        lowestF = f;
        currentKey = key;
        const [lat, lng] = key.split(',').map(Number);
        current = { lat, lng };
      }
    }

    if (Math.abs(current.lat - end.lat) < gridSize && Math.abs(current.lng - end.lng) < gridSize) {
      // Reconstruct path
      const path: Point[] = [current];
      let key = currentKey;
      while (cameFrom.has(key)) {
        const prev = cameFrom.get(key)!;
        path.unshift(prev);
        key = pointToKey(prev);
      }
      return path;
    }

    openSet.delete(currentKey);
    closedSet.add(currentKey);

    for (const neighbor of getNeighbors(current)) {
      const neighborKey = pointToKey(neighbor);
      if (closedSet.has(neighborKey)) continue;

      const currentDataPoint = getClosestDataPoint(current);
      if (!currentDataPoint) continue;

      const tentativeG = (gScore.get(currentKey) || 0) +
        calculateCurrentCost(current, neighbor, currentDataPoint);

      if (!openSet.has(neighborKey)) {
        openSet.add(neighborKey);
      } else if (tentativeG >= (gScore.get(neighborKey) || Infinity)) {
        continue;
      }

      cameFrom.set(neighborKey, current);
      gScore.set(neighborKey, tentativeG);
      fScore.set(neighborKey, tentativeG + heuristic(neighbor, end));
    }
  }

  return [start, end]; // Fallback to direct path if no path found
};