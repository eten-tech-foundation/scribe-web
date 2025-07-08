import { useEffect, useState } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { config } from '@/lib/config';

// Predefined role UUIDs (these should match your database)
const ROLES = {
  USER: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  ADMIN: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  MODERATOR: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
} as const;

const ROLE_NAMES = {
  [ROLES.USER]: 'User',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.MODERATOR]: 'Moderator',
} as const;

interface User {
  id: string; // UUID
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string; // UUID
  createdBy?: string; // UUID
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NewUser {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string; // UUID
  isActive: boolean;
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<NewUser>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: ROLES.USER,
    isActive: true,
  });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.api.url}/users`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Create new user
  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${config.api.url}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const createdUser = await response.json();
      setUsers([...users, createdUser]);
      setNewUser({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        role: ROLES.USER,
        isActive: true,
      });
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  // Update existing user
  const updateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(`${config.api.url}/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: editingUser.username,
          email: editingUser.email,
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          role: editingUser.role,
          isActive: editingUser.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedUser = await response.json();
      setUsers(users.map(user => (user.id === updatedUser.id ? updatedUser : user)));
      setEditingUser(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  // Delete user
  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`${config.api.url}/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <ProtectedRoute>
      <div className='mx-auto max-w-6xl p-6'>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-3xl font-bold text-gray-900'>Users Management</h1>
          <button
            className='rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600'
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Add User'}
          </button>
        </div>

        {error && (
          <div className='mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
            <strong>Error:</strong> {error}
          </div>
        )}

        {showCreateForm && (
          <div className='mb-6 rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-xl font-semibold'>Create New User</h2>
            <form className='space-y-4' onSubmit={createUser}>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>Username</label>
                <input
                  required
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  type='text'
                  value={newUser.username}
                  onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                />
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>Email</label>
                <input
                  required
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  type='email'
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>First Name</label>
                <input
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  type='text'
                  value={newUser.firstName || ''}
                  onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>Last Name</label>
                <input
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  type='text'
                  value={newUser.lastName || ''}
                  onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                />
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>Role</label>
                <select
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value={ROLES.USER}>User</option>
                  <option value={ROLES.ADMIN}>Admin</option>
                  <option value={ROLES.MODERATOR}>Moderator</option>
                </select>
              </div>
              <div className='flex items-center'>
                <input
                  checked={newUser.isActive}
                  className='mr-2'
                  type='checkbox'
                  onChange={e => setNewUser({ ...newUser, isActive: e.target.checked })}
                />
                <label className='text-sm font-medium text-gray-700'>Active</label>
              </div>
              <div className='flex gap-2'>
                <button
                  className='rounded-md bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600'
                  type='submit'
                >
                  Create User
                </button>
                <button
                  className='rounded-md bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600'
                  type='button'
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {editingUser && (
          <div className='mb-6 rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-xl font-semibold'>Edit User</h2>
            <form className='space-y-4' onSubmit={updateUser}>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>Username</label>
                <input
                  required
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  type='text'
                  value={editingUser.username}
                  onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                />
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>Email</label>
                <input
                  required
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  type='email'
                  value={editingUser.email}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>First Name</label>
                <input
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  type='text'
                  value={editingUser.firstName || ''}
                  onChange={e => setEditingUser({ ...editingUser, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>Last Name</label>
                <input
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  type='text'
                  value={editingUser.lastName || ''}
                  onChange={e => setEditingUser({ ...editingUser, lastName: e.target.value })}
                />
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>Role</label>
                <select
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  <option value={ROLES.USER}>User</option>
                  <option value={ROLES.ADMIN}>Admin</option>
                  <option value={ROLES.MODERATOR}>Moderator</option>
                </select>
              </div>
              <div className='flex items-center'>
                <input
                  checked={editingUser.isActive}
                  className='mr-2'
                  type='checkbox'
                  onChange={e => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                />
                <label className='text-sm font-medium text-gray-700'>Active</label>
              </div>
              <div className='flex gap-2'>
                <button
                  className='rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600'
                  type='submit'
                >
                  Update User
                </button>
                <button
                  className='rounded-md bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600'
                  type='button'
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className='py-8 text-center'>
            <div className='inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500'></div>
            <p className='mt-2 text-gray-600'>Loading users...</p>
          </div>
        ) : (
          <div className='overflow-hidden rounded-lg bg-white shadow-md'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                    Username
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                    Full Name
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                    Email
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                    Role
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                    Created
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 bg-white'>
                {users.map(user => (
                  <tr key={user.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900'>
                      {user.username}
                    </td>
                    <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-900'>
                      {[user.firstName, user.lastName].filter(Boolean).join(' ') || '-'}
                    </td>
                    <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-900'>
                      {user.email}
                    </td>
                    <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-900'>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          user.role === ROLES.ADMIN
                            ? 'bg-red-100 text-red-800'
                            : user.role === ROLES.MODERATOR
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {ROLE_NAMES[user.role as keyof typeof ROLE_NAMES] || 'Unknown Role'}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-900'>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-500'>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 text-sm font-medium whitespace-nowrap'>
                      <button
                        className='mr-3 text-blue-600 transition-colors hover:text-blue-900'
                        onClick={() => setEditingUser(user)}
                      >
                        Edit
                      </button>
                      <button
                        className='text-red-600 transition-colors hover:text-red-900'
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className='py-8 text-center text-gray-500'>
                No users found. Create your first user to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
