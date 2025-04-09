import React from 'react';
import { LayerType } from '../types';

interface LegendProps {
  selectedLayer: LayerType;
}

const Legend: React.FC<LegendProps> = ({ selectedLayer }) => {
  const getLegendItems = () => {
    switch (selectedLayer) {
      case 'currents':
        return [
          { color: '#3498db', label: '0-0.1 m/s (Slow)' },
          { color: '#2ecc71', label: '0.1-0.3 m/s (Moderate)' },
          { color: '#f1c40f', label: '0.3-0.6 m/s (Fast)' },
          { color: '#e74c3c', label: '> 0.6 m/s (Very Fast)' }
        ];
      case 'wind':
        return [
          { color: '#3498db', label: '0-2 m/s (Light)' },
          { color: '#2ecc71', label: '2-4 m/s (Moderate)' },
          { color: '#f1c40f', label: '4-6 m/s (Strong)' },
          { color: '#e74c3c', label: '> 6 m/s (Very Strong)' }
        ];
      case 'temperature':
        return [
          { color: 'rgba(0, 0, 255, 1)', label: 'Cold (< 20°C)' },
          { color: 'rgba(0, 255, 255, 1)', label: 'Cool (20-23°C)' },
          { color: 'rgba(255, 255, 0, 1)', label: 'Warm (23-26°C)' },
          { color: 'rgba(255, 0, 0, 1)', label: 'Hot (> 26°C)' }
        ];
      case 'oxygen':
        return [
          { color: 'rgba(0, 0, 139, 1)', label: 'Low (< 150 mmol/m³)' },
          { color: 'rgba(0, 128, 255, 1)', label: 'Moderate (150-200 mmol/m³)' },
          { color: 'rgba(0, 255, 128, 1)', label: 'High (200-250 mmol/m³)' },
          { color: 'rgba(0, 255, 0, 1)', label: 'Very High (> 250 mmol/m³)' }
        ];
      case 'pfz':
        return [
          { color: '#000000', label: 'Potential Fishing Zone' }
        ];
      default:
        return [];
    }
  };

  const legendItems = getLegendItems();
  if (legendItems.length === 0) return null;

  return (
    <div className="absolute bottom-8 right-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-10">
      <h3 className="text-sm font-semibold mb-2 dark:text-white">
        {selectedLayer.charAt(0).toUpperCase() + selectedLayer.slice(1)} Legend
      </h3>
      <div className="space-y-2">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-6 h-4"
              style={{
                backgroundColor: item.color,
                border: '1px solid rgba(0,0,0,0.2)'
              }}
            />
            <span className="text-xs dark:text-gray-200">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend; 