import React, { useEffect, useRef } from 'react';

import { Home, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import MenuItem from './MenuItem';

interface MainMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onDashboardClick: () => void;
  onUsersClick: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ isOpen, onClose, onDashboardClick, onUsersClick }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className='absolute top-full left-[18px] z-50 mt-1 w-56 rounded-md border border-gray-200 bg-[#E7E4DD] shadow-lg'
    >
      <div className='py-2'>
        <MenuItem icon={<Home size={18} />} text={t('dashboard')} onClick={onDashboardClick} />

        <MenuItem icon={<Users size={18} />} text={t('users')} onClick={onUsersClick} />
      </div>
    </div>
  );
};

export default MainMenu;
