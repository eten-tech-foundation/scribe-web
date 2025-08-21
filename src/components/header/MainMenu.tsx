import React from 'react';

import { useLocation } from '@tanstack/react-router';
import { Home, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppStore } from '@/store/store';

import MenuItem from './MenuItem';

interface MainMenuProps {
  children: React.ReactNode;
  onDashboardClick: () => void;
  onUsersClick: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ children, onDashboardClick, onUsersClick }) => {
  const { t } = useTranslation();
  const { userdetail } = useAppStore();
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  const isDashboardActive = location.pathname === '/';
  const isUsersActive = location.pathname === '/user-list';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        hideWhenDetached
        align='start'
        className='w-56 border-gray-200 bg-[#E7E4DD] p-2'
        side='bottom'
        sideOffset={5}
      >
        <div className='space-y-1'>
          <MenuItem
            icon={<Home size={18} />}
            isActive={isDashboardActive}
            text={t('dashboard')}
            onClick={onDashboardClick}
            onClosePopover={() => setOpen(false)}
          />
          {userdetail?.role === 1 && (
            <MenuItem
              icon={<Users size={18} />}
              isActive={isUsersActive}
              text={t('users')}
              onClick={onUsersClick}
              onClosePopover={() => setOpen(false)}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MainMenu;
