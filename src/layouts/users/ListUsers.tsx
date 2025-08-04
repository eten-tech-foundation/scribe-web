// UsersPage Component
import { useMemo } from 'react';

import { Plus } from 'lucide-react';

import { StatusChip } from '@/components/ui/status-chip';

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
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [users]);

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='mb-4 text-2xl font-bold text-gray-900'>Users</h1>
        <button
          className='flex items-center rounded-md bg-[#007EA7] px-4 py-2 text-white transition-colors hover:bg-gray-500'
          onClick={onAddUser}
        >
          <Plus className='mr-2 h-4 w-4' />
          Add User
        </button>
      </div>

      <div className='overflow-hidden rounded-lg bg-white shadow'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-[#F6F4EE]'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                Role
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                Email
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                Status
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {sortedUsers.map(user => (
              <tr
                key={user.id}
                className='cursor-pointer transition-colors hover:bg-gray-50'
                onClick={() => onEditUser(user)}
              >
                <td className='px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900'>
                  {user.displayName}
                </td>
                <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-500'>{user.role}</td>
                <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-500'>{user.email}</td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <StatusChip status={user.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
