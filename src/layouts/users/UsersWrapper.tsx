import { useState } from 'react';

import { useLocation, useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';

import { UserModal } from '@/components/UserModal';
import { useCreateUser, useUpdateUser, useUsers } from '@/hooks/useUsers';
import { UsersPage } from '@/layouts/users/ListUsers';
import { Logger } from '@/lib/services/logger';
import { type User } from '@/lib/types';
import { useAppStore } from '@/store/store';

export const UsersWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userdetail } = useAppStore();
  const { data: users = [], isLoading } = useUsers(userdetail?.email ?? '');

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const [userError, setUserError] = useState<string | null>(null);

  // Derive modal state purely from the URL pathname - no useParams needed
  const pathname = location.pathname;
  const isAddRoute = pathname === '/users/add';

  // Extract userId directly from pathname to avoid useParams `any` type
  const editMatch = /^\/users\/(\w+)\/edit$/.exec(pathname);
  const userId = editMatch?.[1] ?? null;
  const isEditRoute = userId !== null;

  const isModalOpen = isAddRoute || isEditRoute;
  const mode: 'create' | 'edit' = isEditRoute ? 'edit' : 'create';

  // Get selected user for edit mode - prefer navigation state, fallback to list
  const userFromState = location.state.user;
  const userFromList = userId ? users.find(u => String(u.id) === userId) : undefined;
  const selectedUser = userFromState ?? userFromList;

  const isResolvingUser = isEditRoute && !userFromState && isLoading;

  const handleClose = () => {
    setUserError(null);
    void navigate({ to: '/users' });
  };

  const handleAddUser = () => {
    void navigate({ to: '/users/add' });
  };

  const handleEditUser = (user: User) => {
    void navigate({
      to: '/users/$userId/edit',
      params: { userId: String(user.id) },
      state: { user },
    });
  };

  const handleSaveUser = async (userData: User | Omit<User, 'id'>): Promise<void> => {
    setUserError(null);
    try {
      if (mode === 'edit') {
        await updateUserMutation.mutateAsync({
          userData: userData as User,
          email: selectedUser?.email ?? '',
        });
      } else {
        const newUser: Omit<User, 'id'> = {
          ...(userData as Omit<User, 'id'>),
          organization: userdetail?.organization ?? 0,
          createdBy: userdetail?.id ?? 0,
          isActive: true,
        };
        await createUserMutation.mutateAsync({
          userData: newUser,
          email: userdetail?.email ?? '',
        });
      }
      handleClose();
    } catch (error) {
      setUserError(error instanceof Error ? error.message : 'An unknown error occurred');
      Logger.logException(error instanceof Error ? error : new Error(String(error)), {
        source: `Failed to ${mode} user`,
      });
    }
  };

  const mutationIsLoading =
    mode === 'edit' ? updateUserMutation.isPending : createUserMutation.isPending;
  const mutationError =
    mode === 'edit' ? updateUserMutation.error?.message : createUserMutation.error?.message;

  return (
    <>
      <UsersPage
        loading={isLoading}
        users={users}
        onAddUser={handleAddUser}
        onEditUser={handleEditUser}
      />

      {isResolvingUser ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='bg-background flex flex-col items-center gap-3 rounded-lg p-8 shadow-lg'>
            <Loader2 className='text-primary h-8 w-8 animate-spin' />
            <p className='text-muted-foreground text-sm'>Loading user...</p>
          </div>
        </div>
      ) : (
        <UserModal
          error={userError ?? mutationError}
          isLoading={mutationIsLoading}
          isOpen={isModalOpen}
          mode={mode}
          user={selectedUser}
          onClose={handleClose}
          onSave={handleSaveUser}
        />
      )}
    </>
  );
};
