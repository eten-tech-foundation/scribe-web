import React from 'react';

import { LogOut, UserPen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/store';

import MenuItem from './MenuItem';

interface UserMenuProps {
  children: React.ReactNode;
  onEditProfile: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ children, onEditProfile }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { userdetail } = useAppStore();
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        hideWhenDetached
        align='end'
        className='w-56 border-gray-200 bg-[#E9EFF3] p-2'
        side='bottom'
        sideOffset={5}
      >
        <div className='space-y-1'>
          <MenuItem
            icon={<UserPen size={18} />}
            text={t('editProfile')}
            onClick={onEditProfile}
            onClosePopover={() => setOpen(false)}
          />
          <Separator className='my-2 bg-gray-300' />
          <div className='px-2 py-1'>
            <p className='text-sm font-medium text-[#726639]'>{userdetail?.username}</p>
          </div>
          <MenuItem
            icon={<LogOut size={18} />}
            text={t('logout')}
            onClick={handleLogout}
            onClosePopover={() => setOpen(false)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserMenu;
