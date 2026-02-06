import { type ChapterAssignmentStatus, ChapterAssignmentStatusDisplay } from '@/lib/types';

export const getStatusDisplay = (status: ChapterAssignmentStatus): string => {
  return ChapterAssignmentStatusDisplay[status] || status;
};
