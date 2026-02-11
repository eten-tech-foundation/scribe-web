import { useEffect, useMemo, useRef, useState } from 'react';

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type Project, type SortOption } from '@/lib/types';

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

// Adding a component for truncated text with tooltip
const TruncatedText: React.FC<{ text: string }> = ({ text }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [text]);

  if (!isTruncated) {
    return (
      <div ref={textRef} className='truncate'>
        {text}
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div ref={textRef} className='truncate'>
          {text}
        </div>
      </TooltipTrigger>
      <TooltipContent
        align='start'
        className='bg-popover text-popover-foreground border-border rounded-md border px-4 py-2.5 text-sm font-semibold whitespace-nowrap shadow-lg'
        side='top'
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
};

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  loading,
  projects,
  onCreateProject,
  onProjectSelect,
}) => {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const sortedProjects = useMemo(() => {
    const projectsCopy = [...projects];

    switch (sortBy) {
      case 'recent':
        return projectsCopy.sort((a, b) => {
          const dateA = a.lastChapterActivity ? new Date(a.lastChapterActivity).getTime() : 0;
          const dateB = b.lastChapterActivity ? new Date(b.lastChapterActivity).getTime() : 0;
          return dateB - dateA;
        });
      case 'title':
        return projectsCopy.sort((a, b) => a.name.localeCompare(b.name));
      case 'targetLanguage':
        return projectsCopy.sort((a, b) =>
          a.targetLanguageName.localeCompare(b.targetLanguageName)
        );
      default:
        return projectsCopy;
    }
  }, [projects, sortBy]);

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
      projectSourceLanguageName,
      projectTargetLanguageName,
      projectSource
    );
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='mb-6 flex-shrink-0'>
        <h1 className='text-foreground mb-4 text-3xl font-semibold'>{t('projects')}</h1>
        <div className='flex items-center gap-4'>
          <Button className='bg-primary hover:bg-primary/90 text-white' onClick={onCreateProject}>
            {t('createProject')}
          </Button>
          <Select value={sortBy} onValueChange={value => setSortBy(value as SortOption)}>
            <SelectTrigger className='bg-card !h-10 w-[165px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='recent'>{t('Recent')}</SelectItem>
              <SelectItem value='title'>{t('Title')}</SelectItem>
              <SelectItem value='targetLanguage'>{t('Target Language')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
            <TooltipProvider delayDuration={300}>
              <div className='flex h-full flex-col overflow-y-auto'>
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
                  <TableBody className='divide-border divide-y'>
                    {sortedProjects.map(project => (
                      <TableRow
                        key={project.id}
                        className='cursor-pointer border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
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
                        <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
                          <TruncatedText text={project.name} />
                        </TableCell>
                        <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
                          {project.sourceLanguageName}
                        </TableCell>
                        <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm whitespace-nowrap'>
                          {project.targetLanguageName}
                        </TableCell>
                        <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-sm'>
                          <TruncatedText text={project.sourceName} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
};
