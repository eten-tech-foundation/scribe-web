import { Link } from '@tanstack/react-router';
import { HomeIcon, LogOut, MenuIcon, Users2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

export function NavDropdown() {
  const { user, logout, isAuthenticated } = useAuth();

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className='flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 px-2.5 py-2 text-lg font-medium text-gray-800'>
          <MenuIcon className='h-5 w-5' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='ml-6 w-72 border border-gray-300 bg-[#f5f3ee] p-2 text-black'>
        <DropdownMenuItem asChild>
          <Link
            className='mb-2 flex cursor-pointer items-center gap-1 rounded-md p-1 font-medium hover:bg-white'
            to='/dashboard'
          >
            <HomeIcon className='h-4 w-4' />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            className='mb-2 flex cursor-pointer items-center gap-1 rounded-md p-1 font-medium hover:bg-white'
            to='.'
          >
            <Users2 className='h-4 w-4' />
            Users
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='mb-2 flex cursor-pointer items-center justify-between gap-2 rounded-md p-2'
          onClick={handleLogout}
        >
          <div className='flex flex-row items-center gap-2'>
            <LogOut className='h-4 w-4' />
            Logout
          </div>
          {user.name}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
