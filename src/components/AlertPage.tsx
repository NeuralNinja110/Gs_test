import React, { useState, useEffect } from 'react';
import SemiCircleDial from './SemiCircleDial';
import { fetchAlertBulletins, AlertBulletin } from '../services/oceanDataService';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import { Dialog } from '@headlessui/react';

const AlertPage: React.FC = () => {
  const [bulletins, setBulletins] = useState<AlertBulletin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBulletin, setSelectedBulletin] = useState<AlertBulletin | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const getAlertBulletins = async () => {
      try {
        const data = await fetchAlertBulletins();
        setBulletins(data);
      } catch (err) {
        setError(t('alert.error'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getAlertBulletins();
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
          ) : bulletins.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="mt-8 w-full">
                <h3 className="text-xl font-semibold theme-text-primary mb-4 text-center">{t('alert.bulletins')}</h3>
                <div className="grid grid-cols-1 gap-8">
                  {bulletins.map((bulletin) => (
                    <div key={`${bulletin.id}-${bulletin.time || bulletin.english?.substring(0, 20)}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="prose dark:prose-invert max-w-none">
                            <h4 className="text-lg font-semibold mb-2">{t('alert.english')}</h4>
                            <ReactMarkdown>{bulletin.english}</ReactMarkdown>
                          </div>
                          <div className="prose dark:prose-invert max-w-none">
                            <h4 className="text-lg font-semibold mb-2">{t('alert.tamil')}</h4>
                            <ReactMarkdown>{bulletin.tamil}</ReactMarkdown>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <img
                            src={bulletin.image}
                            alt={`${t('alert.bulletin')} ${bulletin.id}`}
                            className="max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedBulletin(bulletin)}
                          />
                          <p className="mt-2 text-sm theme-text-secondary text-center">
                            {t('alert.click_to_enlarge')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Modal */}
              <Dialog
                open={selectedBulletin !== null}
                onClose={() => setSelectedBulletin(null)}
                className="relative z-50"
              >
                <div className="fixed inset-0 bg-black/75" aria-hidden="true" />
                <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4">
                    <Dialog.Panel className="relative bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6 shadow-xl">
                      {selectedBulletin && (
                        <div className="space-y-4">
                          <img
                            src={selectedBulletin.image}
                            alt={`${t('alert.bulletin')} ${selectedBulletin.id}`}
                            className="w-full h-auto rounded-lg"
                          />
                          <button
                            onClick={() => setSelectedBulletin(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <span className="sr-only">{t('alert.close')}</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </Dialog.Panel>
                  </div>
                </div>
              </Dialog>
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
