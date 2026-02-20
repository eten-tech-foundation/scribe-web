import { useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useCreateProject, useProjects } from '@/hooks/useProjects';
import { ProjectsPage } from '@/layouts/projects/ProjectPage';
import { Logger } from '@/lib/services/logger';
import { type CreateProject } from '@/lib/types';
import { useAppStore } from '@/store/store';

import { type CreateProjectData, CreateProjectModal } from './CreateProjectModal';

export const CreateProjectPage: React.FC = () => {
  const { userdetail } = useAppStore();
  const navigate = useNavigate();
  const createProjectMutation = useCreateProject();
  const [projectError, setProjectError] = useState<string | null>(null);

  const { data: projects = [], isLoading: projectsLoading } = useProjects(userdetail?.email ?? '');

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

  const handleProjectSelect = (projectId: number) => {
    void navigate({
      to: '/projects/$projectId',
      params: { projectId: projectId.toString() },
    });
  };

  return (
    <>
      <div className='pointer-events-none opacity-50 select-none'>
        <ProjectsPage
          loading={projectsLoading}
          projects={projects}
          onCreateProject={() => void navigate({ to: '/projects/create' })}
          onProjectSelect={handleProjectSelect}
        />
      </div>
      <CreateProjectModal
        error={projectError}
        isLoading={createProjectMutation.isPending}
        isOpen={true}
        onClose={handleClose}
        onSave={handleSave}
      />
    </>
  );
};
