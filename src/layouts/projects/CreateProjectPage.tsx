import { useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useCreateProject } from '@/hooks/useProjects';
import { Logger } from '@/lib/services/logger';
import { type CreateProject } from '@/lib/types';
import { useAppStore } from '@/store/store';

import { type CreateProjectData, CreateProjectModal } from './CreateProjectModal';

export const CreateProjectPage: React.FC = () => {
  const { userdetail } = useAppStore();
  const navigate = useNavigate();
  const createProjectMutation = useCreateProject();
  const [projectError, setProjectError] = useState<string | null>(null);

  const handleSave = async (projectData: CreateProjectData) => {
    try {
      setProjectError(null);
      const newProjectData: Omit<CreateProject, 'id' | 'createdAt' | 'updatedAt'> = {
        name: projectData.title,
        targetLanguage: projectData.targetLanguage,
        sourceLanguage: projectData.sourceLanguage,
        bibleId: projectData.sourceBible,
        bookId: projectData.books,
        organization: Number(userdetail?.organization),
        createdBy: Number(userdetail?.id),
        metadata: {},
      };

      await createProjectMutation.mutateAsync({
        projectData: newProjectData,
        email: userdetail ? userdetail.email : '',
      });

      void navigate({ to: '/projects' });
    } catch (error) {
      setProjectError('Failed to create project');
      Logger.logException(error instanceof Error ? error : new Error(String(error)), {
        source: 'Failed to create project.',
      });
    }
  };

  const handleClose = () => {
    void navigate({ to: '/projects' });
  };

  return (
    <CreateProjectModal
      error={projectError}
      isLoading={createProjectMutation.isPending}
      isOpen={true}
      onClose={handleClose}
      onSave={handleSave}
    />
  );
};
