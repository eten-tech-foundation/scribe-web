import { useMemo } from 'react';

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type Project } from '@/lib/types';

interface ProjectsPageProps {
  projects: Project[];
  loading?: boolean;
  onCreateProject: () => void;
  onProjectSelect: (
    projectId: number,
    projectTitle: string,
    projectSourceLanguageName: string,
    projectTargetLanguageName: string,
    projectSource: string
  ) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  loading,
  projects,
  onCreateProject,
  onProjectSelect,
}) => {
  const { t } = useTranslation();

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);

  const handleRowClick = (
    projectId: number,
    projectTitle: string,
    projectSourceLanguageName: string,
    projectTargetLanguageName: string,
    projectSource: string
  ) => {
    onProjectSelect(
      projectId,
      projectTitle,
      projectSource,
      projectSourceLanguageName,
      projectTargetLanguageName
    );
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='mb-6 flex-shrink-0'>
        <h1 className='text-foreground mb-4 text-3xl font-semibold'>{t('projects')}</h1>
        <Button className='bg-primary hover:bg-primary/90 text-white' onClick={onCreateProject}>
          {t('createProject')}
        </Button>
      </div>

      <div className='flex-1 overflow-hidden rounded-lg border shadow'>
        <div className='flex h-full flex-col'>
          {loading ? (
            <div className='flex items-center justify-center gap-2 py-8'>
              <Loader2 className='h-5 w-5 animate-spin text-gray-500' />
              <span className='text-gray-500'>{t('loadingProjects')}</span>
            </div>
          ) : sortedProjects.length === 0 ? (
            <div className='flex items-center justify-center py-8'>
              <span className='text-gray-500'>{t('noProjectsFound')}</span>
            </div>
          ) : (
            <>
              {/* Fixed Header */}
              <div className='flex-1 overflow-y-auto'>
                <Table className='table-fixed'>
                  <TableHeader className='sticky top-0 z-10'>
                    <TableRow className='hover:bg-transparent'>
                      <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                        {t('title')}
                      </TableHead>

                      <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                        {t('sourceLanguage')}
                      </TableHead>
                      <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                        {t('targetLanguage')}
                      </TableHead>
                      <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                        {t('sourceBible')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  {/* Scrollable Body */}
                  {/* <div className='flex-1 overflow-y-auto'>
                <Table> */}
                  <TableBody className='divide-border divide-y'>
                    {sortedProjects.map(project => (
                      <TableRow
                        key={project.id}
                        className='cursor-pointer border-b transition-colors hover:bg-gray-50'
                        onClick={() =>
                          handleRowClick(
                            project.id,
                            project.name,
                            project.sourceName,
                            project.sourceLanguageName,
                            project.targetLanguageName
                          )
                        }
                      >
                        <TableCell
                          className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'
                          title={project.name}
                        >
                          {project.name}
                        </TableCell>
                        <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
                          {project.sourceLanguageName}
                        </TableCell>
                        <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
                          {project.targetLanguageName}
                        </TableCell>
                        <TableCell
                          className='text-popover-foreground w-1/4 truncate px-6 py-4 text-sm'
                          title={project.sourceName}
                        >
                          {project.sourceName}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
