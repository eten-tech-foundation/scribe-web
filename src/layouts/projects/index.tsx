import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { DataTable, type TableColumn } from '@/components/ui/DataTable'; // Adjust path as needed

// Define the Project type based on your requirements
export interface Project {
  id: string | number;
  title: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceBible: string;
}

interface ProjectsPageProps {
  projects: Project[];
  loading?: boolean;
  onCreateProject: () => void;
  onEditProject?: (project: Project) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  loading,
  projects,
  onCreateProject,
  onEditProject,
}) => {
  const { t } = useTranslation();

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => a.title.localeCompare(b.title));
  }, [projects]);

  const columns: Array<TableColumn<Project>> = [
    {
      key: 'title',
      header: t('title'),
      render: project => project.title,
    },
    {
      key: 'sourceLanguage',
      header: t('sourceLanguage'),
      render: project => project.sourceLanguage,
    },
    {
      key: 'targetLanguage',
      header: t('targetLanguage'),
      render: project => project.targetLanguage,
    },
    {
      key: 'sourceBible',
      header: t('sourceBible'),
      render: project => project.sourceBible,
    },
  ];

  return (
    <div className='flex h-full flex-col'>
      <div className='mb-6 flex-shrink-0'>
        <h1 className='text-foreground mb-4 text-3xl font-semibold'>{t('projects')}</h1>
        <Button className='bg-primary hover:bg-primary/90 text-white' onClick={onCreateProject}>
          {t('createProject')}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={sortedProjects}
        emptyMessage={t('noProjectsFound')}
        loading={loading}
        loadingMessage={t('loadingProjects')}
        onRowClick={onEditProject}
      />
    </div>
  );
};
