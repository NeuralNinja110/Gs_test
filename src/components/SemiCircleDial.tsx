import React, { useState } from 'react';
import { FaSearch, FaBell, FaFolder, FaFish, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const SemiCircleDial: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navItems: NavItem[] = [
    {
      id: 'home',
      icon: <FaHome className="w-6 h-6" />,
      label: t('nav.home'),
      onClick: () => navigate('/')
    },
    {
      id: 'scanfin',
      icon: <FaSearch className="w-6 h-6" />,
      label: t('nav.scanfin'),
      onClick: () => navigate('/scanfin')
    },
    {
      id: 'alerts',
      icon: <FaBell className="w-6 h-6" />,
      label: t('nav.alerts'),
      onClick: () => navigate('/alert')
    },
    {
      id: 'ids-files',
      icon: <FaFolder className="w-6 h-6" />,
      label: t('nav.ids_files'),
      onClick: () => console.log('IDs & Files clicked')
    },
    {
      id: 'fishy',
      icon: <FaFish className="w-6 h-6" />,
      label: t('nav.fishy'),
      onClick: () => console.log('Fishy clicked')
    }
  ];

  return (
    <div
      className="fixed left-0 top-1/2 -translate-y-1/2 z-50"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={`
        bg-blue-500 rounded-r-full transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-48' : 'w-16'}
        h-96 flex flex-col justify-center items-start
      `}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`
              flex items-center text-white p-4 hover:bg-blue-600 w-full
              transition-all duration-300 ease-in-out
              ${isExpanded ? 'justify-start' : 'justify-center'}
            `}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span
              className={`
                ml-3 whitespace-nowrap overflow-hidden transition-all duration-300
                ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
              `}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SemiCircleDial;