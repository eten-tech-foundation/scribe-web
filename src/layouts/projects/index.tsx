import React, { useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useCreateProject, useProjects } from '@/hooks/useProjects';
import { CreateProjectModal, type CreateProjectData } from '@/layouts/projects/CreateProjectModal';
import { ProjectsPage } from '@/layouts/projects/ProjectPage';
import { Logger } from '@/lib/services/logger';
import { type CreateProject } from '@/lib/types';
import { useAppStore } from '@/store/store';

export const ProjectsWrapper: React.FC = () => {
  const { userdetail } = useAppStore();
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects(userdetail ? userdetail.email : '');
  const createProjectMutation = useCreateProject();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);

  const handleSaveProject = async (projectData: CreateProjectData) => {
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

      closeModal();
    } catch (error) {
      setProjectError('Failed to create project');
      Logger.logException(error instanceof Error ? error : new Error(String(error)), {
        source: 'Failed to create project.',
      });
    }
  };

  const openCreateModal = () => {
    setIsModalOpen(true);
    setProjectError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setProjectError(null);
  };

  const handleProjectSelect = (projectId: number) => {
    void navigate({
      to: '/projects/$projectId',
      params: { projectId: projectId.toString() },
    });
  };

  return (
    <>
      <ProjectsPage
        loading={isLoading}
        projects={projects}
        onCreateProject={openCreateModal}
        onProjectSelect={handleProjectSelect}
      />

      <CreateProjectModal
        error={projectError}
        isLoading={createProjectMutation.isPending}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveProject}
      />
    </>
  );
};
