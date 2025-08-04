import React, { useEffect, useRef } from 'react';

import { LogOut, UserPen } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

import MenuItem from './MenuItem';

// interface User {
//   displayName: string;
//   email?: string;
// }

interface UserMenuProps {
  //   user: User;
  isOpen: boolean;
  onClose: () => void;
  onEditProfile: () => void;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onClose, onEditProfile }) => {
  const { user, logout, isAuthenticated } = useAuth();
  //   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  return (
    <div
      ref={menuRef}
      className='absolute top-full right-[18px] z-50 mt-1 w-56 rounded-md border border-gray-200 bg-[#E7E4DD] shadow-lg'
    >
      <div className='py-2'>
        <MenuItem icon={<UserPen size={18} />} text='Edit Profile' onClick={onEditProfile} />
        <div className='mx-2 my-1 border-t border-gray-300' />
        <div className='my-1 px-8 py-2'>
          <p className='text-sm font-medium text-[#726639]'>{user.nickname}</p>
        </div>
        <div>
          <MenuItem icon={<LogOut size={18} />} text='Logout' onClick={handleLogout} />
        </div>
      </div>
    </div>
  );
};

export default UserMenu;
