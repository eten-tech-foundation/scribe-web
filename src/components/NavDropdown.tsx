import { Link } from '@tanstack/react-router';
import { HomeIcon, MenuIcon, Users2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

export function NavDropdown() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className='flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-2.5 py-2 text-lg font-medium text-gray-800 hover:bg-gray-100'>
          <MenuIcon className='h-5 w-5' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='dark:bg-background ml-2 w-72 border border-gray-300 bg-[#f5f3ee] p-2 text-black dark:text-white'>
        <DropdownMenuItem asChild>
          <Link
            className='mb-2 flex cursor-pointer items-center gap-1 rounded-md p-1 font-medium hover:bg-white dark:hover:bg-gray-700'
            to='/'
          >
            <HomeIcon className='h-4 w-4' />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            className='mb-2 flex cursor-pointer items-center gap-1 rounded-md p-1 font-medium hover:bg-white dark:hover:bg-gray-700'
            to='/users'
          >
            <Users2 className='h-4 w-4' />
            Users
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
