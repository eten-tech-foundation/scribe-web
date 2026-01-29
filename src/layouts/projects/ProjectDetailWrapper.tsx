import { useNavigate, useParams, useSearch } from '@tanstack/react-router';

import { ProjectDetailPage } from './ProjectDetailPage';

interface ProjectDetailSearch {
  title?: string;
  source?: string;
  sourceLang?: string;
  targetLang?: string;
}

export const ProjectDetailWrapper: React.FC = () => {
  const { projectId } = useParams({ from: '/projects/$projectId' });
  const navigate = useNavigate();
  const search = useSearch({ from: '/projects/$projectId' }) as ProjectDetailSearch;

  const handleBack = () => {
    void navigate({ to: '/projects' });
  };

  // Parse query parameters for project details
  const projectTitle = search.title ?? '';
  const projectSource = search.source ?? '';
  const projectSourceLang = search.sourceLang ?? '';
  const projectTargetLang = search.targetLang ?? '';

  return (
    <ProjectDetailPage
      projectId={parseInt(projectId)}
      projectSource={projectSource}
      projectSourceLanguageName={projectSourceLang}
      projectTargetLanguageName={projectTargetLang}
      projectTitle={projectTitle}
      onBack={handleBack}
    />
  );
};
