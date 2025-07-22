import { Link } from '@tanstack/react-router';
import { FeatherIcon } from 'lucide-react';

import { UserProfile } from '@/components/auth/UserProfile';
import { NavDropdown } from '@/components/NavDropdown';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/hooks/useAuth';

export const Navigation = () => {
  const { isAuthenticated, isLoading, login } = useAuth();

  const handleSignIn = () => {
    login();
  };

  return (
    <div className='flex w-full items-center justify-between'>
      <div className='flex items-center gap-2'>
        <NavDropdown />
        <Link className='ml-4 flex items-center gap-2 text-xl font-bold' to='/'>
          <FeatherIcon className='h-6 w-6' />
          Scribe
        </Link>
      </div>

      <div className='flex items-center gap-2'>
        {isLoading ? (
          <div className='h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600'></div>
        ) : isAuthenticated ? (
          <div className='flex items-center gap-2'>
            <ThemeToggle />
            <UserProfile />
          </div>
        ) : (
          <button
            className='cursor-pointer rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-700'
            onClick={handleSignIn}
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};
