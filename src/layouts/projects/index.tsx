import React from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useProjects } from '@/hooks/useProjects';
import { ProjectsPage } from '@/layouts/projects/ProjectPage';
import { useAppStore } from '@/store/store';

export const ProjectsWrapper: React.FC = () => {
  const { userdetail } = useAppStore();
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects(userdetail ? userdetail.email : '');

  const handleProjectSelect = (projectId: number) => {
    void navigate({
      to: '/projects/$projectId',
      params: { projectId: projectId.toString() },
    });
  };

  return (
    <ProjectsPage
      loading={isLoading}
      projects={projects}
      onCreateProject={() => void navigate({ to: '/projects/create' })}
      onProjectSelect={handleProjectSelect}
    />
  );
};
