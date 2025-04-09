import React, { useState, useEffect } from 'react';
import SemiCircleDial from './SemiCircleDial';
import { fetchAlertImage, AlertImageData } from '../services/oceanDataService';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

const AlertPage: React.FC = () => {
  const [alertImage, setAlertImage] = useState<AlertImageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage();
  
  // Fishermen warning images from IMD
  const warningImages = [
    "https://mausam.imd.gov.in/backend/assets/pdf_to_img_acwcc/1_fishermen_67f26d4d09ebe.png",
    "https://mausam.imd.gov.in/backend/assets/pdf_to_img_acwcc/2_fishermen_67f26d4e5fc21.png",
    "https://mausam.imd.gov.in/backend/assets/pdf_to_img_acwcc/3_fishermen_67f26d5134154.png"
  ];

  useEffect(() => {
    const getAlertImage = async () => {
      try {
        const data = await fetchAlertImage();
        setAlertImage(data);
      } catch (err) {
        setError(t('alert.error'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getAlertImage();
  }, []);

  return (
    <div className="min-h-screen theme-bg p-8">
      <LanguageSelector />
      <SemiCircleDial />
      <div className="max-w-4xl mx-auto theme-card rounded-lg shadow-lg overflow-hidden">
        <div className="bg-red-600 p-6">
          <h1 className="text-3xl font-bold text-white">{t('alert.title')}</h1>
          <p className="text-white mt-2 opacity-80">{t('alert.subtitle')}</p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">{t('alert.loading')}</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">
              <p className="text-xl font-semibold">{error}</p>
            </div>
          ) : alertImage ? (
            <div className="flex flex-col items-center">
              <div className="mb-6 max-w-full overflow-hidden">
                <img 
                  src={alertImage.url} 
                  alt={alertImage.name || t('alert.weather_warning')} 
                  className="max-w-full h-auto rounded-lg shadow-md"
                />
              </div>
              <div className="mt-4 w-full">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>
                      {alertImage.name || t('alert.weather_alert')}
                    </ReactMarkdown>
                  </div>
                </div>
                <p className="theme-text-secondary text-center">
                  {t('alert.safety_notice')}
                </p>
              </div>
              
              <div className="mt-8 w-full">
                <h3 className="text-xl font-semibold theme-text-primary mb-4 text-center">{t('alert.bulletins')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {warningImages.map((imageUrl, index) => (
                    <div key={index} className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                      <img 
                        src={imageUrl} 
                        alt={`${t('alert.bulletin')} ${index + 1}`} 
                        className="w-full h-auto"
                        loading="lazy"
                      />
                      <div className="p-3 bg-gray-50 dark:bg-gray-800">
                        <p className="text-sm theme-text-secondary text-center">{t('alert.bulletin')} {index + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p className="text-xl">{t('alert.no_alerts')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertPage;