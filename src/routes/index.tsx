import { createFileRoute } from '@tanstack/react-router';

import { RoleBasedHomePage } from '@/components/RoleBasedHomePage';

export const Route = createFileRoute('/')({
  component: RoleBasedHomePage,
});
