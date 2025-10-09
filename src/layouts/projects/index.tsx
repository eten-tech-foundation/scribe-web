import React, { useState } from 'react';

import { useCreateProject, useProjects } from '@/hooks/useProjects';
import { CreateProjectModal, type CreateProjectData } from '@/layouts/projects/CreateProjectModal';
import { ProjectDetailPage } from '@/layouts/projects/ProjectDetailPage';
import { ProjectsPage } from '@/layouts/projects/ProjectPage';
import { Logger } from '@/lib/services/logger';
import { type CreateProject } from '@/lib/types';
import { useAppStore } from '@/store/store';

export const ProjectsWrapper: React.FC = () => {
  const { userdetail } = useAppStore();
  const { data: projects = [], isLoading } = useProjects(userdetail ? userdetail.email : '');
  const createProjectMutation = useCreateProject();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectProjectTitle, setSelectProjectTitle] = useState<string>('');
  const [selectedProjectSource, setSelectedProjectSource] = useState<string>('');
  const [selectedProjectSourceLang, setSelectedProjectSourceLang] = useState<string>('');
  const [selectedProjectTargetLang, setSelectedProjectTargetLang] = useState<string>('');

  const [showProjectDetail, setShowProjectDetail] = useState(false);
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

  const handleProjectSelect = (
    projectId: number,
    title: string,
    source: string,
    sourceLang: string,
    targetLang: string
  ) => {
    setSelectedProjectId(projectId);
    setSelectProjectTitle(title);
    setSelectedProjectSource(source);
    setSelectedProjectSourceLang(sourceLang);
    setSelectedProjectTargetLang(targetLang);
    setShowProjectDetail(true);
  };

  const handleBackToProjects = () => {
    setShowProjectDetail(false);
    setSelectedProjectId(null);
  };

  if (showProjectDetail) {
    return (
      <ProjectDetailPage
        projectId={selectedProjectId ?? null}
        projectSource={selectedProjectSource}
        projectSourceLanguageName={selectedProjectSourceLang}
        projectTargetLanguageName={selectedProjectTargetLang}
        projectTitle={selectProjectTitle}
        onBack={handleBackToProjects}
      />
    );
  }

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
