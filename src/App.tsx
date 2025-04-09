import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Map from './components/Map';
import { fetchOceanData } from './services/oceanDataService';
import SemiCircleDial from './components/SemiCircleDial';
import ScanfinPage from './components/ScanfinPage';
import AlertPage from './components/AlertPage';
import { LayerType, ProcessedData } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import ThemeToggle from './components/ThemeToggle';
import './styles/theme.css';
import LanguageSelector from './components/LanguageSelector';

const MapPage: React.FC = () => {
  const [data, setData] = React.useState<ProcessedData>({});
  const [layerDates, setLayerDates] = React.useState<{ [key: string]: string[] }>({});
  const [selectedDate, setSelectedDate] = React.useState('');
  const [selectedLayer, setSelectedLayer] = React.useState<LayerType>('currents');
  const [dateRange, setDateRange] = React.useState({ start: '', end: '' });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const { t } = useLanguage();

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const { data: oceanData, layerDates: dates } = await fetchOceanData();
        setData(oceanData);
        setLayerDates(dates);

        // Set date range and initial date based on selected layer
        const layerSpecificDates = dates[selectedLayer] || [];
        if (layerSpecificDates.length > 0) {
          const sortedDates = layerSpecificDates.sort();
          setDateRange({
            start: sortedDates[0],
            end: sortedDates[sortedDates.length - 1]
          });
          setSelectedDate(sortedDates[0]);
        }
      } catch (err) {
        setError('Failed to load ocean data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen p-8 relative theme-bg">
      <LanguageSelector />
      <SemiCircleDial />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold theme-text-primary">{t('nav.home')}</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => auth.signOut()}
              className="px-4 py-2 text-sm theme-text-secondary hover:text-gray-800"
            >
              {t('nav.signout')}
            </button>
          </div>
        </div>
        
        <div className="theme-card rounded-lg shadow-md p-6 mb-8">
          {loading ? (
            <div className="text-center text-gray-500 py-12">
              {t('map.loading')}
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">
              {t('map.error')}
            </div>
          ) : (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <p className="text-gray-600">
                  {t('map.data_available')} {dateRange.start} {t('map.to')} {dateRange.end}
                </p>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  {(layerDates[selectedLayer] || []).sort().map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-4 ml-auto">
                <span className="text-gray-600">{t('map.layer')}:</span>
                <select
                  value={selectedLayer}
                  onChange={(e) => {
                    const newLayer = e.target.value as LayerType;
                    setSelectedLayer(newLayer);
                    // Update selected date when changing layers
                    const layerSpecificDates = layerDates[newLayer] || [];
                    if (layerSpecificDates.length > 0) {
                      setSelectedDate(layerSpecificDates[0]);
                    }
                  }}
                  className="border rounded px-3 py-2"
                >
                  <option value="currents">{t('map.layers.currents')}</option>
                  <option value="oxygen">{t('map.layers.oxygen')}</option>
                  <option value="temperature">{t('map.layers.temperature')}</option>
                  <option value="pfz">{t('map.layers.pfz')}</option>
                  <option value="wind">{t('map.layers.wind')}</option>
                </select>
              </div>
            </div>
          )}
          
          {selectedDate && data[selectedDate] && (
            <Map 
              data={data[selectedDate]} 
              selectedLayer={selectedLayer} 
              pfzData={selectedLayer === 'pfz' ? data[selectedDate].pfz : null}
            />
          )}
          
          {!loading && !error && !Object.keys(data).length && (
            <div className="text-center text-gray-500 py-12">
              {t('map.no_data')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [user] = useAuthState(auth);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scanfin"
            element={
              <ProtectedRoute>
                <ScanfinPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alert"
            element={
              <ProtectedRoute>
                <AlertPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;