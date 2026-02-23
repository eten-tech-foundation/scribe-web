import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { config } from '@/lib/config';

export interface ProjectUser {
  id: number;
  projectId: number;
  userId: number;
  displayName: string;
  roleID: number;
  addedAt: string | null;
}

interface ApiErrorResponse {
  message?: string;
}

const parseErrorMessage = async (res: Response, fallback: string): Promise<never> => {
  const error = (await res.json().catch(() => null)) as ApiErrorResponse | null;
  throw new Error(error?.message ?? fallback);
};
// -------------------------
// --- Fetch functions   ---
// -------------------------

const fetchProjectUsers = async (projectId: number, email: string): Promise<ProjectUser[]> => {
  const res = await fetch(`${config.api.url}/projects/${projectId}/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': email,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch project users');

  return (await res.json()) as ProjectUser[];
};

const addProjectUser = async (
  projectId: number,
  userId: number,
  email: string
): Promise<ProjectUser> => {
  const res = await fetch(`${config.api.url}/projects/${projectId}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': email,
    },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    await parseErrorMessage(res, 'Failed to add user to project');
  }

  return (await res.json()) as ProjectUser;
};

const removeProjectUser = async (
  projectId: number,
  userId: number,
  email: string
): Promise<void> => {
  const res = await fetch(`${config.api.url}/projects/${projectId}/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': email,
    },
  });

  if (!res.ok) {
    await parseErrorMessage(res, 'Failed to remove user from project');
  }
};

// -------------------------
// --- Hooks             ---
// -------------------------

export const useProjectUsers = (
  projectId: number,
  email: string,
  options?: { enabled?: boolean }
) => {
  return useQuery<ProjectUser[]>({
    queryKey: ['projectUsers', projectId, email],
    queryFn: () => fetchProjectUsers(projectId, email),
    enabled: (options?.enabled ?? true) && !!projectId && !!email,
  });
};

export const useAddProjectUser = (projectId: number, email: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: number }) => addProjectUser(projectId, userId, email),
    onSuccess: newUser => {
      queryClient.setQueryData<ProjectUser[]>(['projectUsers', projectId, email], prev => {
        if (!prev) return [newUser];
        return [...prev, newUser].sort((a, b) => a.displayName.localeCompare(b.displayName));
      });
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: ['projectUsers', projectId, email] });
    },
  });
};

export const useRemoveProjectUser = (projectId: number, email: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: number }) => removeProjectUser(projectId, userId, email),
    onMutate: async ({ userId }) => {
      await queryClient.cancelQueries({ queryKey: ['projectUsers', projectId, email] });

      const previousUsers = queryClient.getQueryData<ProjectUser[]>([
        'projectUsers',
        projectId,
        email,
      ]);

      queryClient.setQueryData<ProjectUser[]>(['projectUsers', projectId, email], prev =>
        prev ? prev.filter(u => u.userId !== userId) : []
      );

      return { previousUsers };
    },
    onError: (err, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['projectUsers', projectId, email], context.previousUsers);
      }
      throw err;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projectUsers', projectId, email] });
    },
  });
};
