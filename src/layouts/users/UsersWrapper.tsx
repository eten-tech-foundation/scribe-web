import { useState } from 'react';

import { UserModal } from '@/components/UserModal';
import { useCreateUser, useUpdateUser, useUsers } from '@/hooks/useUsers';
import { UsersPage } from '@/layouts/users/ListUsers';
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

  const handleSaveUser = async (userData: User | Omit<User, 'id'>) => {
    try {
      if (modalMode === 'create') {
        (userData.organization = userdetail?.organization ?? 0),
          (userData.createdBy = userdetail?.id ?? 0),
          (userData.isActive = true),
          // Creating new user - pass both userData and email as an object
          await createUserMutation.mutateAsync({
            userData: userData as Omit<User, 'id'>,
            email: userdetail ? userdetail.email : '',
          });
      } else {
        // Updating existing user - pass both userData and email as an object
        await updateUserMutation.mutateAsync({
          userData: userData as User,
          email: userdetail ? userdetail.email : '',
        });
      }
      closeModal();
    } catch (error) {
      const errorMessage =
        modalMode === 'create'
          ? 'Failed to create user. Please try again.'
          : 'Failed to update user. Please try again.';
      console.error(errorMessage);
      console.error('Error saving user:', error);
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
