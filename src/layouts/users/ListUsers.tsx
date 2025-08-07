// UsersPage Component
import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Types
interface User {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: 'invited' | 'verified';
}

interface UsersPageProps {
  users: User[];
  onAddUser: () => void;
  onEditUser: (user: User) => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({ users, onAddUser, onEditUser }) => {
  const { t } = useTranslation();

  const getStatusVariant = (status: 'invited' | 'verified') => {
    return status === 'invited' ? 'secondary' : 'default';
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [users]);

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-foreground mb-4 text-3xl font-semibold'>{t('users')}</h1>
        <Button className='bg-primary hover:bg-primary/90 text-white' onClick={onAddUser}>
          {t(`addUser`)}
        </Button>
      </div>

      <div className='overflow-hidden rounded-lg border border-[#D9D8D0] bg-white shadow'>
        <table className='min-w-full divide-y divide-[#D9D8D0]'>
          <thead className='bg-[#F6F4EE]'>
            <tr>
              <th className='text-accent-foreground px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                {t(`name`)}
              </th>
              <th className='text-accent-foreground px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                {t(`role`)}
              </th>
              <th className='text-accent-foreground px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                {t(`email`)}
              </th>
              <th className='text-accent-foreground px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                {t(`status`)}
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-[#D9D8D0] bg-white'>
            {sortedUsers.map(user => (
              <tr
                key={user.id}
                className='cursor-pointer transition-colors hover:bg-gray-50'
                onClick={() => onEditUser(user)}
              >
                <td className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                  {user.displayName}
                </td>
                <td className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                  {user.role}
                </td>
                <td className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                  {user.email}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <Badge variant={getStatusVariant(user.status)}>
                    {user.status === 'invited' ? t('invited') : t('verified')}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
