import { useState } from 'react';

import { UserModal } from '@/components/UserModal';
import { mockUsers, type User } from '@/data/mockUsers';
import { UsersPage } from '@/layouts/users/ListUsers';

export const UsersWrapper: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleSaveUser = (userData: User | Omit<User, 'id'>) => {
    if (modalMode === 'create') {
      const newUser: User = {
        ...(userData as Omit<User, 'id'>),
        id: Date.now().toString(),
      };
      setUsers((prev: User[]) => [...prev, newUser]);
    } else {
      setUsers((prev: User[]) =>
        prev.map(user => (user.id === (userData as User).id ? (userData as User) : user))
      );
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
      <UsersPage users={users} onAddUser={openCreateModal} onEditUser={openEditModal} />

      <UserModal
        isOpen={isModalOpen}
        mode={modalMode}
        user={selectedUser}
        onClose={closeModal}
        onSave={handleSaveUser}
      />
    </>
  );
};
