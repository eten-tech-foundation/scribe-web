import React, { useState } from 'react';

import { useNavigate } from '@tanstack/react-router';
import { SquareUser } from 'lucide-react';

import MainMenu from '@/components/header/MainMenu';
import UserMenu from '@/components/header/UserMenu';
import { EditProfile } from '@/layouts/profile/EditProfile';

const Header: React.FC = () => {
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const navigate = useNavigate();

  const onNavigateToDashboard = () => {
    void navigate({ to: '/' });
  };

  const onNavigateToUsers = () => {
    void navigate({ to: '/user-list' });
  };

  const toggleMainMenu = () => {
    setIsMainMenuOpen(!isMainMenuOpen);
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsMainMenuOpen(false);
  };

  const handleEditProfile = () => {
    setIsEditProfileOpen(true);
    setIsUserMenuOpen(false);
  };

  const closeEditProfile = () => {
    setIsEditProfileOpen(false);
  };

  return (
    <>
      <header className='bg-primary relative flex h-[56px] items-center'>
        <div className='my-4 flex w-full items-center justify-between'>
          <div className='flex items-center'>
            <div className='relative flex items-center pl-[18px]'>
              <button aria-label='Main menu' className='cursor-pointer' onClick={toggleMainMenu}>
                <img alt='Main Menu' src='/icons/main-menu.svg' />
              </button>

              <MainMenu
                isOpen={isMainMenuOpen}
                onClose={() => setIsMainMenuOpen(false)}
                onDashboardClick={() => {
                  onNavigateToDashboard();
                  setIsMainMenuOpen(false);
                }}
                onUsersClick={() => {
                  onNavigateToUsers();
                  setIsMainMenuOpen(false);
                }}
              />
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
                <img alt='Logo' src='/icons/scribe-logo.svg' />
              </div>
            </div>
          </div>

          <div className='relative pr-[18px]'>
            <button
              aria-label='User menu'
              className='flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-md bg-gray-100 p-1.5 transition-colors duration-150 hover:bg-gray-200'
              onClick={toggleUserMenu}
            >
              <SquareUser className='text-gray-600' size={25} strokeWidth={2.5} />
            </button>

            <UserMenu
              isOpen={isUserMenuOpen}
              onClose={() => setIsUserMenuOpen(false)}
              onEditProfile={handleEditProfile}
              onLogout={() => {
                setIsUserMenuOpen(false);
              }}
            />
          </div>
        </div>
      </header>
      {/* Edit Profile Modal */}
      {isEditProfileOpen && <EditProfile isOpen={isEditProfileOpen} onClose={closeEditProfile} />}
    </>
  );
};

export default Header;
