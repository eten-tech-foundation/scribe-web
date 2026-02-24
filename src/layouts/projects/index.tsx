import React from 'react';

import { getRouteApi, useNavigate } from '@tanstack/react-router';

import { useCreateProject, useProjects } from '@/hooks/useProjects';
import { ProjectsPage } from '@/layouts/projects/ProjectPage';
import { Logger } from '@/lib/services/logger';
import { type CreateProject } from '@/lib/types';
import { useAppStore } from '@/store/store';

import { type CreateProjectData, CreateProjectModal } from './CreateProjectModal';

const routeApi = getRouteApi('/projects');

export const ProjectsWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { modal } = routeApi.useSearch();
  const { userdetail } = useAppStore();

  const { data: projects = [], isLoading } = useProjects(userdetail?.email ?? '');
  const createProjectMutation = useCreateProject();

  const handleOpenCreate = () => {
    void navigate({
      to: '/projects',
      search: { modal: 'create' as const },
    });
  };

  const handleCloseCreate = () => {
    void navigate({
      to: '/projects',
      search: {},
    });
  };

  const handleProjectSelect = (projectId: number) => {
    void navigate({
      to: '/projects/$projectId',
      params: { projectId: projectId.toString() },
    });
  };

  const handleSave = async (projectData: CreateProjectData) => {
    try {
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
        email: userdetail?.email ?? '',
      });

      handleCloseCreate();
    } catch (error) {
      Logger.logException(error instanceof Error ? error : new Error(String(error)), {
        source: 'Failed to create project.',
      });
    }
  };

  return (
    <>
      <ProjectsPage
        loading={isLoading}
        projects={projects}
        onCreateProject={handleOpenCreate}
        onProjectSelect={handleProjectSelect}
      />

      <CreateProjectModal
        error={createProjectMutation.error?.message}
        isLoading={createProjectMutation.isPending}
        isOpen={modal === 'create'}
        onClose={handleCloseCreate}
        onSave={handleSave}
      />
    </>
  );
};
