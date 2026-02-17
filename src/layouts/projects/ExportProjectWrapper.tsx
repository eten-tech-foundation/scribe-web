import { useMemo } from 'react';

import { useNavigate, useParams } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';

import { useChapterAssignments } from '@/hooks/useChapterAssignment';
import { useProjectDetails } from '@/hooks/useProjectDetails';
import { useProjectUnitBooks } from '@/hooks/useProjectUnitBooks';
import { useAppStore } from '@/store/store';

import { ExportProjectDialog } from './ExportProjectDialog';

export const ExportProjectWrapper: React.FC = () => {
  const { projectId } = useParams({ from: '/projects/$projectId/export' });
  const navigate = useNavigate();
  const { userdetail } = useAppStore();

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useProjectDetails(projectId, userdetail?.email ?? '');

  const { data: chapterAssignments, isLoading: assignmentsLoading } = useChapterAssignments(
    projectId,
    userdetail?.email ?? ''
  );

  const { data: books, isLoading: booksLoading } = useProjectUnitBooks(
    projectId,
    userdetail?.email ?? ''
  );

  const projectUnitId = useMemo(() => {
    return chapterAssignments?.[0]?.projectUnitId ?? null;
  }, [chapterAssignments]);

  const exportBooks = useMemo(() => {
    if (!books || !chapterAssignments) return [];

    return books.map(book => {
      const bookAssignments = chapterAssignments.filter(
        assignment => assignment.bookNameEng === book.engDisplayName
      );

      const completedChapters = bookAssignments.filter(
        assignment => assignment.completedVerses === assignment.totalVerses
      ).length;

      return {
        bookId: book.bookId,
        engDisplayName: book.engDisplayName,
        code: book.code,
        completedChapters,
        totalChapters: bookAssignments.length || 0,
      };
    });
  }, [books, chapterAssignments]);

  const handleClose = () => {
    void navigate({ to: '/projects/$projectId', params: { projectId } });
  };

  const isLoading = projectLoading || assignmentsLoading || booksLoading;

  if (projectLoading) {
    return (
      <div className='flex h-full items-center justify-center gap-2'>
        <Loader2 className='h-5 w-5 animate-spin text-gray-500' />
        <span className='text-gray-500'>Loading project...</span>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className='flex h-full items-center justify-center'>
        <span className='text-red-500'>
          {projectError ? 'Failed to load project' : 'Project not found'}
        </span>
      </div>
    );
  }

  return (
    <ExportProjectDialog
      books={exportBooks}
      isLoading={isLoading}
      isOpen={true}
      projectName={project.name}
      projectUnitId={projectUnitId}
      onClose={handleClose}
    />
  );
};
