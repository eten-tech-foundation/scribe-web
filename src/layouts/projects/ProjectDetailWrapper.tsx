import { useNavigate, useParams } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';

import { useProjectDetails } from '@/hooks/useProjectDetails';
import { useAppStore } from '@/store/store';

import { ProjectDetailPage } from './ProjectDetailPage';

export const ProjectDetailWrapper: React.FC = () => {
  const { projectId } = useParams({ from: '/projects/$projectId' });
  const navigate = useNavigate();
  const { userdetail } = useAppStore();

  const { data: project, isLoading, error } = useProjectDetails(projectId, userdetail?.email ?? '');

  const handleBack = () => {
    void navigate({ to: '/projects' });
  };

  const handleExport = () => {
    void navigate({
      to: '/projects/$projectId/export',
      params: { projectId },
    });
  };

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center gap-2'>
        <Loader2 className='h-5 w-5 animate-spin text-gray-500' />
        <span className='text-gray-500'>Loading project details...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className='flex h-full items-center justify-center'>
        <span className='text-red-500'>
          {error ? 'Failed to load project details' : 'Project not found'}
        </span>
      </div>
    );
  }

  return (
    <ProjectDetailPage
      projectId={project.id}
      projectSource={project.sourceName}
      projectSourceLanguageName={project.sourceLanguageName}
      projectTargetLanguageName={project.targetLanguageName}
      projectTitle={project.name}
      onBack={handleBack}
      onExport={handleExport}
    />
  );
};
