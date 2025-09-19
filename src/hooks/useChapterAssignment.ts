import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { config } from '@/lib/config';
import { type ChapterAssignmentProgress } from '@/lib/types';

export interface AssignChapterPayload {
  chapterAssignmentId: number[];
  userId: number;
}

const fetchChapterAssignments = async (
  projectId: string,
  email: string
): Promise<ChapterAssignmentProgress[]> => {
  const res = await fetch(`${config.api.url}/projects/${projectId}/chapter-assignments/progress`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': email,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch chapter assignments');

  const data = (await res.json()) as ChapterAssignmentProgress[];
  return data;
};

export interface AssignChaptersResponse {
  success: boolean;
  message?: string;
  assignedUser?: string;
}

const assignChaptersToUser = async (
  payload: AssignChapterPayload & { email: string }
): Promise<AssignChaptersResponse> => {
  const { email, userId, chapterAssignmentId } = payload;

  const response = await fetch(`${config.api.url}/users/${userId}/chapter-assignments`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': email,
    },
    body: JSON.stringify({ chapterAssignmentIds: chapterAssignmentId }),
  });

  if (!response.ok) {
    throw new Error('Failed to assign chapters');
  }

  return (await response.json()) as AssignChaptersResponse;
};

export const useChapterAssignments = (projectId: string, email: string) => {
  return useQuery<ChapterAssignmentProgress[]>({
    queryKey: ['chapterAssignments', projectId, email],
    queryFn: () => fetchChapterAssignments(projectId, email),
    enabled: !!projectId && !!email,
  });
};

export const useAssignChapters = (projectId: string, email: string, assignedUserName?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignChaptersToUser,
    onMutate: async variables => {
      await queryClient.cancelQueries({
        queryKey: ['chapterAssignments', projectId, email],
      });

      const previousAssignments = queryClient.getQueryData<ChapterAssignmentProgress[]>([
        'chapterAssignments',
        projectId,
        email,
      ]);

      if (previousAssignments && assignedUserName) {
        const updatedAssignments = previousAssignments.map(assignment => {
          if (variables.chapterAssignmentId.includes(assignment.assignmentId)) {
            return {
              ...assignment,
              assigned_user: assignedUserName,
              total_verses: assignment.totalVerses,
              completed_verses: assignment.completedVerses,
            };
          }
          return assignment;
        });

        queryClient.setQueryData(['chapterAssignments', projectId, email], updatedAssignments);
      }

      return { previousAssignments };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousAssignments) {
        queryClient.setQueryData(
          ['chapterAssignments', projectId, email],
          context.previousAssignments
        );
      }
    },
    onSuccess: () => {
      // Force refetch to get fresh data from server
      void queryClient.refetchQueries({
        queryKey: ['chapterAssignments', projectId, email],
      });
    },
  });
};
