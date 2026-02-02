import React, { useState } from 'react';

import { useNavigate } from '@tanstack/react-router';
import { Menu, SquareUserRound } from 'lucide-react';

import MainMenu from '@/components/header/MainMenu';
import UserMenu from '@/components/header/UserMenu';
import { SettingsModal } from '@/components/SettingsModal';
import { EditProfile } from '@/layouts/profile/EditProfile';

const Header: React.FC = () => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const onNavigateToDashboard = () => {
    void navigate({ to: '/' });
  };

  const onNavigateToUsers = () => {
    void navigate({ to: '/users' });
  };

  const onNavigateToProjects = () => {
    void navigate({ to: '/projects' });
  };

  const handleEditProfile = () => {
    setIsEditProfileOpen(true);
  };

  const closeEditProfile = () => {
    setIsEditProfileOpen(false);
  };

  const handleToggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <>
      <header className='bg-primary relative flex h-[56px] items-center'>
        <div className='my-4 flex w-full items-center justify-between'>
          <div className='flex items-center'>
            <div className='relative flex items-center pl-[18px]'>
              <MainMenu
                onDashboardClick={onNavigateToDashboard}
                onProjectsClick={onNavigateToProjects}
                onUsersClick={onNavigateToUsers}
              >
                <button
                  aria-label='User menu'
                  className='hover:bg-hover bg-background flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-md p-1.5 transition-colors duration-150'
                >
                  <Menu className='text-foreground' size={35} strokeWidth={2.5} />
                </button>
              </MainMenu>
            </div>
            <div className='pl-[32px]'>
              <div
                className='flex cursor-pointer items-center transition-opacity duration-150'
                role='button'
                tabIndex={0}
                onClick={onNavigateToDashboard}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onNavigateToDashboard();
                  }
                }}
              >
                <img alt='Logo' className='h-13 w-auto' src='/icons/fluent-logo.svg' />
              </div>
            </div>
          </div>

          <div className='relative pr-[18px]'>
            <UserMenu onEditProfile={handleEditProfile} onToggleSettings={handleToggleSettings}>
              <button
                aria-label='User menu'
                className='hover:bg-hover bg-background flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-md p-1.5 transition-colors duration-150'
              >
                <SquareUserRound className='text-foreground' size={35} strokeWidth={2.5} />
              </button>
            </UserMenu>
          </div>
        </div>
      </header>
      {/* Edit Profile Modal */}
      {isEditProfileOpen && <EditProfile isOpen={isEditProfileOpen} onClose={closeEditProfile} />}
      {/* Settings Modal - Placeholder */}
      {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={handleToggleSettings} />}
    </>
  );
};

export default Header;
