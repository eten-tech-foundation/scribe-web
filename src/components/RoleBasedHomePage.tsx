import { useNavigate } from '@tanstack/react-router';

import { UserDashboard } from '@/layouts/dashboard/user';
import { useAppStore } from '@/store/store';

export const RoleBasedHomePage = () => {
  const { userdetail } = useAppStore();
  const navigate = useNavigate();
  if (userdetail?.role === 1) {
    void navigate({ to: '/projects' });
  }

  return <UserDashboard />;
};
