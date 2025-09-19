import { HomePage } from '@/layouts/dashboard/admin';
import { UserDashboard } from '@/layouts/dashboard/user';
import { useAppStore } from '@/store/store';

export const RoleBasedHomePage = () => {
  const { userdetail } = useAppStore();

  if (userdetail?.role === 1) {
    return <HomePage />;
  }

  return <UserDashboard />;
};
