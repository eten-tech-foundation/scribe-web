import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type TableColumn } from '@/components/ui/DataTable'; // Adjust path as needed
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

  const columns: Array<TableColumn<User>> = [
    {
      key: 'username',
      header: t('name'),
      render: user => user.username,
    },
    {
      key: 'role',
      header: t('role'),
      render: user => getRoleLabel(user.role),
    },
    {
      key: 'email',
      header: t('email'),
      render: user => user.email,
    },
    {
      key: 'status',
      header: t('status'),
      render: user => (
        <Badge variant={getStatusVariant(user.status as 'invited' | 'verified')}>
          {user.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className='flex h-full flex-col'>
      <div className='mb-6 flex-shrink-0'>
        <h1 className='text-foreground mb-4 text-3xl font-semibold'>{t('users')}</h1>
        <Button className='bg-primary hover:bg-primary/90 text-white' onClick={onAddUser}>
          {t('addUser')}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={sortedUsers}
        emptyMessage={t('noUsersFound')}
        loading={loading}
        loadingMessage={t('loadingUsers')}
        onRowClick={onEditUser}
      />
    </div>
  );
};
