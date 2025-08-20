import { useMemo } from 'react';

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getRoleLabel } from '@/lib/constants/roles';
import { type User } from '@/lib/types';

interface UsersPageProps {
  users: User[];
  loading?: boolean;
  onAddUser: () => void;
  onEditUser: (user: User) => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({ loading, users, onAddUser, onEditUser }) => {
  const { t } = useTranslation();

  const getStatusVariant = (status: 'invited' | 'verified') => {
    return status === 'invited' ? 'secondary' : 'default';
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.username.localeCompare(b.username));
  }, [users]);

  return (
    <div className='flex h-full flex-col'>
      <div className='mb-6 flex-shrink-0'>
        <h1 className='text-foreground mb-4 text-3xl font-semibold'>{t('users')}</h1>
        <Button className='bg-primary hover:bg-primary/90 text-white' onClick={onAddUser}>
          {t('addUser')}
        </Button>
      </div>

      <div className='flex-1 overflow-hidden rounded-lg border border-[#D9D8D0] bg-white shadow'>
        <div className='flex h-full flex-col'>
          <div className='flex-1 overflow-y-auto'>
            {loading ? (
              <div className='flex items-center justify-center gap-2 py-8'>
                <Loader2 className='h-5 w-5 animate-spin text-gray-500' />
                <span className='text-gray-500'>{t('loadingUsers')}</span>
              </div>
            ) : sortedUsers.length === 0 ? (
              <div className='flex items-center justify-center py-8'>
                <span className='text-gray-500'>{t('noUsersFound')}</span>
              </div>
            ) : (
              <Table>
                <TableHeader className='border-b border-[#D9D8D0] bg-[#F6F4EE]'>
                  <TableRow className='hover:bg-transparent'>
                    <TableHead className='text-accent-foreground px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                      {t('name')}
                    </TableHead>
                    <TableHead className='text-accent-foreground px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                      {t('role')}
                    </TableHead>
                    <TableHead className='text-accent-foreground px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                      {t('email')}
                    </TableHead>
                    <TableHead className='text-accent-foreground px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                      {t('status')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className='divide-y divide-[#D9D8D0] bg-white'>
                  {sortedUsers.map(user => (
                    <TableRow
                      key={user.id}
                      className='cursor-pointer border-b border-[#D9D8D0] transition-colors hover:bg-gray-50'
                      onClick={() => onEditUser(user)}
                    >
                      <TableCell className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                        {user.username}
                      </TableCell>
                      <TableCell className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                        {getRoleLabel(user.role)}
                      </TableCell>
                      <TableCell className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                        {user.email}
                      </TableCell>
                      <TableCell className='px-6 py-4 whitespace-nowrap'>
                        <Badge variant={getStatusVariant(user.status as 'invited' | 'verified')}>
                          {user.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
