import { Link } from '@tanstack/react-router';
import { LogOut, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import logger from '@/lib/error-logger';

export function UserProfile() {
  const { user, logout, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      logger.error(error as Error, 'UserProfile', 'handleLogout');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className='flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-2.5 py-2 text-lg font-medium text-gray-800 hover:bg-gray-100'>
          <User className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='dark:bg-background mr-2 ml-6 w-48 border border-gray-300 bg-[#f5f3ee] p-4 text-black dark:text-white'>
        <DropdownMenuItem asChild>
          <Link
            className='text-medium mb-2 flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-gray-300 dark:hover:bg-gray-700'
            to='/'
          >
            <User className='h-4 w-4' />
            Edit Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <div className='text-medium flex items-center gap-2'>{user.name}</div>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Button
            className='text-md flex h-8 w-full cursor-pointer items-center justify-start gap-2 font-medium text-gray-800 dark:text-white dark:hover:bg-gray-700'
            variant='ghost'
            onClick={handleLogout}
          >
            <LogOut className='h-4 w-4' />
            Log out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
