import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Neptune - Ocean Data',
    'nav.scanfin': 'Scanfin',
    'nav.alerts': 'Alerts',
    'nav.ids_files': 'IDs & Files',
    'nav.fishy': 'Fishy',
    'nav.signout': 'Sign Out',

    // Map Page
    'map.loading': 'Loading ocean data...',
    'map.error': 'Failed to load ocean data',
    'map.data_available': 'Data available from',
    'map.to': 'to',
    'map.layer': 'Layer',
    'map.no_data': 'No ocean data available',
    'map.layers.currents': 'Ocean Currents',
    'map.layers.oxygen': 'Oxygen Levels',
    'map.layers.temperature': 'Temperature',
    'map.layers.pfz': 'Potential Fishing Zone',
    'map.layers.wind': 'Wind',
    'map.location.error': 'Error getting location',
    'map.location.not_supported': 'Geolocation is not supported by your browser',
    'map.location.your_location': 'Your Location',
    
    // Alert Page
    'alert.title': 'Indian Meteorological Department Warning for Fishermen',
    'alert.subtitle': 'Important safety information for maritime activities',
    'alert.loading': 'Loading alert information...',
    'alert.error': 'Failed to load alert image. Please try again later.',
    'alert.no_alerts': 'No alerts available at this time.',
    'alert.safety_notice': 'This alert is issued by the Indian Meteorological Department to ensure the safety of fishermen and maritime activities. Please take all necessary precautions and follow the guidelines provided in the warning.',
    'alert.bulletins': 'Fishermen Warning Bulletins',
    'alert.bulletin': 'Bulletin',
    'alert.weather_warning': 'Weather warning for fishermen',
    'alert.weather_alert': 'Weather Alert',

    // Language Selector
    'language.select': 'Select Language',
    'language.english': 'English',
    'language.tamil': 'Tamil',

    // Scanfin Page
    'scanfin.title': 'Scanfin Analysis',
    'scanfin.subtitle': 'Upload a fish image to analyze its characteristics',
    'scanfin.upload_prompt': 'Click to upload or drag and drop',
    'scanfin.supported_formats': 'Supported formats: JPG, PNG',
    'scanfin.analyzing': 'Analyzing...',
    'scanfin.analyze_button': 'Analyze Fish',
    'scanfin.characteristics': 'Characteristics',
    'scanfin.edibility': 'Edibility',
    'scanfin.location': 'Location',
    'scanfin.depth': 'Depth',
    'scanfin.conservation_status': 'Conservation Status',
    'scanfin.color': 'Color',
    'scanfin.appearance': 'Appearance',
    'scanfin.average_price': 'Average Price in India'
  },
  ta: {
    // Navigation
    'nav.home': 'நெப்டியூன் - கடல் தரவு',
    'nav.scanfin': 'ஸ்கேன்ஃபின்',
    'nav.alerts': 'எச்சரிக்கைகள்',
    'nav.ids_files': 'ஐடிகள் & கோப்புகள்',
    'nav.fishy': 'மீன்',
    'nav.signout': 'வெளியேறு',

    // Map Page
    'map.loading': 'கடல் தரவு ஏற்றப்படுகிறது...',
    'map.error': 'கடல் தரவை ஏற்ற முடியவில்லை',
    'map.data_available': 'கிடைக்கும் தரவு',
    'map.to': 'முதல்',
    'map.layer': 'அடுக்கு',
    'map.no_data': 'கடல் தரவு எதுவும் கிடைக்கவில்லை',
    'map.layers.currents': 'கடல் நீரோட்டங்கள்',
    'map.layers.oxygen': 'ஆக்சிஜன் அளவுகள்',
    'map.layers.temperature': 'வெப்பநிலை',
    'map.layers.pfz': 'சாத்தியமான மீன்பிடி மண்டலம்',
    'map.layers.wind': 'காற்று',
    'map.location.error': 'இருப்பிடத்தைப் பெறுவதில் பிழை',
    'map.location.not_supported': 'உங்கள் உலாவியில் புவி-இருப்பிடம் ஆதரிக்கப்படவில்லை',
    'map.location.your_location': 'உங்கள் இருப்பிடம்',
    
    // Alert Page
    'alert.title': 'இந்திய வானிலை ஆய்வு மையம் மீனவர்களுக்கான எச்சரிக்கை',
    'alert.subtitle': 'கடல்சார் நடவடிக்கைகளுக்கான முக்கிய பாதுகாப்பு தகவல்',
    'alert.loading': 'எச்சரிக்கை தகவல்களை ஏற்றுகிறது...',
    'alert.error': 'எச்சரிக்கை படத்தை ஏற்ற முடியவில்லை. பிறகு முயற்சிக்கவும்.',
    'alert.no_alerts': 'தற்போது எந்த எச்சரிக்கைகளும் இல்லை.',
    'alert.safety_notice': 'இந்த எச்சரிக்கை மீனவர்கள் மற்றும் கடல்சார் நடவடிக்கைகளின் பாதுகாப்பை உறுதி செய்வதற்காக இந்திய வானிலை ஆய்வு மையத்தால் வழங்கப்படுகிறது. எச்சரிக்கையில் வழங்கப்பட்டுள்ள வழிகாட்டுதல்களைப் பின்பற்றி அனைத்து தேவையான முன்னெச்சரிக்கை நடவடிக்கைகளையும் எடுக்கவும்.',
    'alert.bulletins': 'மீனவர்களுக்கான எச்சரிக்கை அறிக்கைகள்',
    'alert.bulletin': 'அறிக்கை',
    'alert.weather_warning': 'மீனவர்களுக்கான வானிலை எச்சரிக்கை',
    'alert.weather_alert': 'வானிலை எச்சரிக்கை',

    // Language Selector
    'language.select': 'மொழியைத் தேர்ந்தெடுக்கவும்',
    'language.english': 'ஆங்கிலம்',
    'language.tamil': 'தமிழ்',

    // Scanfin Page
    'scanfin.title': 'ஸ்கேன்ஃபின் பகுப்பாய்வு',
    'scanfin.subtitle': 'பகுப்பாய்வு செய்ய மீன் படத்தை பதிவேற்றவும்',
    'scanfin.upload_prompt': 'பதிவேற்ற கிளிக் செய்யவும் அல்லது இழுத்து விடவும்',
    'scanfin.supported_formats': 'ஆதரிக்கப்படும் வடிவங்கள்: JPG, PNG',
    'scanfin.analyzing': 'பகுப்பாய்வு செய்கிறது...',
    'scanfin.analyze_button': 'மீனை பகுப்பாய்வு செய்',
    'scanfin.characteristics': 'பண்புகள்',
    'scanfin.edibility': 'உண்ணக்கூடியது',
    'scanfin.location': 'இருப்பிடம்',
    'scanfin.depth': 'ஆழம்',
    'scanfin.conservation_status': 'பாதுகாப்பு நிலை',
    'scanfin.color': 'நிறம்',
    'scanfin.appearance': 'தோற்றம்',
    'scanfin.average_price': 'இந்தியாவில் சராசரி விலை'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};