import { useState } from 'react';

import { UserModal } from '@/components/UserModal';
import { useCreateUser, useUpdateUser, useUsers } from '@/hooks/useUsers';
import { UsersPage } from '@/layouts/users/ListUsers';
import { Logger } from '@/lib/services/logger';
import { type User } from '@/lib/types';
import { useAppStore } from '@/store/store';

export const UsersWrapper: React.FC = () => {
  const { userdetail } = useAppStore();
  const { data: users = [], isLoading } = useUsers(userdetail ? userdetail.email : '');
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userError, setUserError] = useState<string | null>(null);

  const handleSaveUser = async (userData: User | Omit<User, 'id'>) => {
    setUserError(null);
    try {
      if (modalMode === 'create') {
        userData.organization = userdetail?.organization ?? 0;
        userData.createdBy = userdetail?.id ?? 0;
        userData.isActive = true;
        // Creating new user
        await createUserMutation.mutateAsync({
          userData: userData as Omit<User, 'id'>,
          email: userdetail ? userdetail.email : '',
        });
      } else {
        // Updating existing user
        await updateUserMutation.mutateAsync({
          userData: userData as User,
          email: userdetail ? userdetail.email : '',
        });
      }
      closeModal();
    } catch (error) {
      setUserError(error instanceof Error ? error.message : 'An unknown error occurred');
      Logger.logException(error instanceof Error ? error : new Error(String(error)), {
        source: modalMode === 'create' ? 'Failed to create user.' : 'Failed to update user.',
      });
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setUserError(null);
  };

  return (
    <>
      <UsersPage
        loading={isLoading}
        users={users}
        onAddUser={openCreateModal}
        onEditUser={openEditModal}
      />

      <UserModal
        error={userError}
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
        isOpen={isModalOpen}
        mode={modalMode}
        user={selectedUser}
        onClose={closeModal}
        onSave={handleSaveUser}
      />
    </>
  );
};
