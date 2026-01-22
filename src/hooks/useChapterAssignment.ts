import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { config } from '@/lib/config';
import { type ChapterAssignmentProgress, type UserChapterAssignment } from '@/lib/types';

export interface AssignChapterPayload {
  chapterAssignmentId: number[];
  userId: number;
  peerCheckerId?: number;
}

export interface ChapterAssignmentsByUser {
  assignedChapters: UserChapterAssignment[];
  peerCheckChapters: UserChapterAssignment[];
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

  return (await res.json()) as ChapterAssignmentProgress[];
};
const fetchChapterAssignmentsByUserId = async (
  userId: number,
  email: string
): Promise<ChapterAssignmentsByUser> => {
  const res = await fetch(`${config.api.url}/users/${userId}/chapter-assignments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': email,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch user chapter assignments');

  return (await res.json()) as ChapterAssignmentsByUser;
};

export interface AssignChaptersResponse {
  success: boolean;
  message?: string;
  assignedUser?: string;
  peerChecker?: string;
}

const assignChaptersToUser = async (
  payload: AssignChapterPayload & { email: string }
): Promise<number[]> => {
  const { email, userId, chapterAssignmentId, peerCheckerId } = payload;

  const response = await fetch(`${config.api.url}/users/${userId}/chapter-assignments`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': email,
    },
    body: JSON.stringify({
      chapterAssignmentIds: chapterAssignmentId,
      peerCheckerId: peerCheckerId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to assign chapters');
  }

  return (await response.json()) as number[];
};

export const useChapterAssignments = (projectId: string, email: string) => {
  return useQuery<ChapterAssignmentProgress[]>({
    queryKey: ['chapterAssignments', projectId, email],
    queryFn: () => fetchChapterAssignments(projectId, email),
    enabled: !!projectId && !!email,
  });
};

export const useChapterAssignmentsByUserId = (userId: number, email: string) => {
  return useQuery<ChapterAssignmentsByUser>({
    queryKey: ['userChapterAssignments', userId, email],
    queryFn: () => fetchChapterAssignmentsByUserId(userId, email),
    enabled: !!userId && !!email,
  });
};

export const useAssignChapters = (
  projectId: string,
  email: string,
  assignedUserName?: string,
  peerCheckerName?: string
) => {
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

      if (previousAssignments && (assignedUserName || peerCheckerName)) {
        const updatedAssignments = previousAssignments.map(assignment => {
          if (variables.chapterAssignmentId.includes(assignment.assignmentId)) {
            return {
              ...assignment,
              ...(assignedUserName && { assigned_user: assignedUserName }),
              ...(peerCheckerName && { peer_checker: peerCheckerName }),
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
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['chapterAssignments', projectId, email],
      });

      void queryClient.invalidateQueries({
        queryKey: ['userChapterAssignments', variables.userId],
      });
    },
  });
};
