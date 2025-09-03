import React, { useState } from 'react';

import { CreateProjectModal, type CreateProjectData } from '@/components/CreateProjectModal';
import { useCreateProject, useProjects } from '@/hooks/useProjects';
import { ProjectsPage } from '@/layouts/projects';
import { Logger } from '@/lib/services/logger';
import { type CreateProject } from '@/lib/types';
import { useAppStore } from '@/store/store';

export const ProjectsWrapper: React.FC = () => {
  const { userdetail } = useAppStore();
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
        bible_id: projectData.sourceBible,
        book_id: projectData.books,
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

  return (
    <>
      <ProjectsPage loading={isLoading} projects={projects} onCreateProject={openCreateModal} />

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
