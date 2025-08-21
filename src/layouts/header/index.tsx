import React, { useState } from 'react';

import { useNavigate } from '@tanstack/react-router';
import { SquareUser } from 'lucide-react';

import MainMenu from '@/components/header/MainMenu';
import UserMenu from '@/components/header/UserMenu';
import { EditProfile } from '@/layouts/profile/EditProfile';

const Header: React.FC = () => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const navigate = useNavigate();

  const onNavigateToDashboard = () => {
    void navigate({ to: '/' });
  };

  const onNavigateToUsers = () => {
    void navigate({ to: '/user-list' });
  };

  const handleEditProfile = () => {
    setIsEditProfileOpen(true);
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
              <MainMenu onDashboardClick={onNavigateToDashboard} onUsersClick={onNavigateToUsers}>
                <button aria-label='Main menu' className='cursor-pointer'>
                  <img alt='Main Menu' src='/icons/main-menu.svg' />
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
                <img alt='Logo' src='/icons/scribe-logo.svg' />
              </div>
            </div>
          </div>

          <div className='relative pr-[18px]'>
            <UserMenu onEditProfile={handleEditProfile}>
              <button
                aria-label='User menu'
                className='flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-md bg-gray-100 p-1.5 transition-colors duration-150 hover:bg-gray-200'
              >
                <SquareUser className='text-gray-600' size={25} strokeWidth={2.5} />
              </button>
            </UserMenu>
          </div>
        </div>
      </header>
      {/* Edit Profile Modal */}
      {isEditProfileOpen && <EditProfile isOpen={isEditProfileOpen} onClose={closeEditProfile} />}
    </>
  );
};

export default Header;
