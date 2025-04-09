import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  const languages = [
    { code: 'en', name: 'language.english' },
    { code: 'ta', name: 'language.tamil' }
  ];

  return (
    <div 
      className="fixed top-4 right-4 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden
        transition-all duration-300 ease-in-out
        ${isHovered ? 'w-40' : 'w-12'}
        ${isHovered ? 'h-auto' : 'h-12'}
      `}>
        <div className="flex flex-col">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code as 'en' | 'ta')}
              className={`
                px-4 py-2 text-left text-sm
                ${language === lang.code ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}
                ${!isHovered && language !== lang.code ? 'hidden' : ''}
                transition-colors duration-200
              `}
            >
              {isHovered ? t(lang.name) : lang.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


export default LanguageSelector;