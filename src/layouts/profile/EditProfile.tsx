import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserModal } from '@/components/UserModal';
import { useUpdateUser } from '@/hooks/useUsers';
import { type User } from '@/lib/types';
import { useAppStore } from '@/store/store';

interface EditProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfile({ isOpen, onClose }: EditProfileProps) {
  const { userdetail, setUserDetail } = useAppStore();
  const updateUserMutation = useUpdateUser();

  const handleSaveUser = async (userData: User | Omit<User, 'id'>) => {
    try {
      // Updating existing user - pass both userData and email as an object
      const res = await updateUserMutation.mutateAsync({
        userData: userData as User,
        email: userdetail ? userdetail.email : '',
      });
      setUserDetail({
        id: res.id,
        email: res.email,
        username: res.username,
        role: res.role,
        organization: res.organization,
        firstName: res.firstName,
        lastName: res.lastName,
        status: res.status,
      });

      onClose();
    } catch (error) {
      const errorMessage = 'Failed to update user. Please try again.';
      console.error(errorMessage);
      console.error('Error saving user:', error);
    }
  };

  return (
    <ProtectedRoute>
      <UserModal
        isLoading={updateUserMutation.isPending}
        isOpen={isOpen}
        mode={'edit'}
        user={userdetail}
        onClose={onClose}
        onSave={handleSaveUser}
      />
    </ProtectedRoute>
  );
}
