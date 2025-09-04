import { useParams } from '@tanstack/react-router';

import { useProject } from '@/hooks/useProjects';
import { ProjectDetailPage } from '@/layouts/projects/ProjectDetailPage';
import { useAppStore } from '@/store/store';

export const ProjectDetailWrapper: React.FC = () => {
  const { projectId } = useParams({ from: '/projects/$projectId' });
  const { userdetail } = useAppStore();

  const { data: project, isLoading } = useProject(projectId, userdetail ? userdetail.email : '');

  return <ProjectDetailPage loading={isLoading} project={project} />;
};
