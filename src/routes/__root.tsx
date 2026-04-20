import { createRootRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { RootComponent } from '@/features/root/RootComponent';
import { modalSchema } from '@/lib/modal-schema';

export const Route = createRootRoute({
  validateSearch: z.object({
    modal: modalSchema.optional(),
  }),
  component: RootComponent,
});
