import { useMemo } from 'react';

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
          {t(`addUser`)}
        </Button>
      </div>

      <div className='flex-1 overflow-hidden rounded-lg border border-[#D9D8D0] bg-white shadow'>
        <div className='flex h-full flex-col'>
          <div
            className='grid flex-shrink-0 grid-cols-4 gap-0 border-b border-[#D9D8D0] bg-[#F6F4EE]'
            style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}
          >
            <div className='text-accent-foreground px-6 py-3 text-left text-sm font-semibold tracking-wider'>
              {t(`name`)}
            </div>
            <div className='text-accent-foreground px-6 py-3 text-left text-sm font-semibold tracking-wider'>
              {t(`role`)}
            </div>
            <div className='text-accent-foreground px-6 py-3 text-left text-sm font-semibold tracking-wider'>
              {t(`email`)}
            </div>
            <div className='text-accent-foreground px-6 py-3 text-left text-sm font-semibold tracking-wider'>
              {t(`status`)}
            </div>
          </div>

          <div className='flex-1 overflow-y-auto'>
            {loading ? (
              <div className='flex items-center justify-center gap-2 py-8'>
                <Loader2 className='h-5 w-5 animate-spin text-gray-500' />
                <span className='text-gray-500'>Loading...</span>
              </div>
            ) : (
              <div className='divide-y divide-[#D9D8D0] bg-white'>
                {sortedUsers.map(user => (
                  <div
                    key={user.id}
                    className='grid cursor-pointer grid-cols-4 gap-0 transition-colors hover:bg-gray-50'
                    style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}
                    onClick={() => onEditUser(user)}
                  >
                    <div className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                      {user.username}
                    </div>
                    <div className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                      {getRoleLabel(user.role)}
                    </div>
                    <div className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                      {user.email}
                    </div>
                    <div className='px-6 py-4 whitespace-nowrap'>
                      <Badge variant={getStatusVariant(user.status as 'invited' | 'verified')}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
