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
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  loading,
  projects,
  onCreateProject,
}) => {
  const { t } = useTranslation();

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);

  return (
    <div className='flex h-full flex-col'>
      <div className='mb-6 flex-shrink-0'>
        <h1 className='text-foreground mb-4 text-3xl font-semibold'>{t('projects')}</h1>
        <Button className='bg-primary hover:bg-primary/90 text-white' onClick={onCreateProject}>
          {t('createProject')}
        </Button>
      </div>

      <div className='flex-1 overflow-hidden rounded-lg border border-[#D9D8D0] bg-white shadow'>
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
              <div className='flex-shrink-0 border-b border-[#D9D8D0] bg-[#F6F4EE]'>
                <Table className='table-fixed'>
                  <TableHeader>
                    <TableRow className='hover:bg-transparent'>
                      <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                        {t('name')}
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
                </Table>
              </div>

              {/* Scrollable Body */}
              <div className='flex-1 overflow-y-auto'>
                <Table>
                  <TableBody className='divide-y divide-[#D9D8D0] bg-white'>
                    {sortedProjects.map(project => (
                      <TableRow
                        key={project.id}
                        className='border-b border-[#D9D8D0] transition-colors hover:bg-gray-50'
                      >
                        <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
                          {project.name}
                        </TableCell>
                        <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
                          {project.sourceLanguageName}
                        </TableCell>
                        <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
                          {project.targetLanguageName}
                        </TableCell>
                        <TableCell className='text-popover-foreground w-1/4 truncate px-6 py-4 text-sm'>
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
