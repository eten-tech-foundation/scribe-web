import { useState } from 'react';

import { useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useChapterAssignments } from '@/hooks/useProjects';
import type { ProjectItem, User } from '@/lib/types';
import { useAppStore } from '@/store/store';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusText = (item: ProjectItem) => {
  return `${item.completedVerses} of ${item.totalVerses}`;
};

export function UserHomePage() {
  const [navigatingToProject, setNavigatingToProject] = useState<string | null>(null);
  const { userdetail, userDashboardTab, setUserDashboardTab } = useAppStore();
  const navigate = useNavigate();
  const { data: projectData = [], isLoading: loading } = useChapterAssignments(userdetail as User);

  const myWorkData: ProjectItem[] = projectData
    .filter(item => item.submittedTime === null)
    .sort((a, b) => {
      const aHasCompleted = a.completedVerses > 0;
      const bHasCompleted = b.completedVerses > 0;

      if (aHasCompleted && !bHasCompleted) return -1;
      if (!aHasCompleted && bHasCompleted) return 1;

      if (a.book !== b.book) return a.book.localeCompare(b.book);

      return a.chapterNumber - b.chapterNumber;
    });

  const historyData: ProjectItem[] = projectData
    .filter(item => item.submittedTime !== null && item.submittedTime.trim() !== '')
    .sort((a, b) => {
      const dateA = a.submittedTime ? new Date(a.submittedTime).getTime() : 0;
      const dateB = b.submittedTime ? new Date(b.submittedTime).getTime() : 0;
      return dateB - dateA;
    });

  const handleRowClick = async (item: ProjectItem, isHistory: boolean) => {
    const projectKey = `${item.projectUnitId}-${item.bookId}-${item.chapterNumber}`;
    setNavigatingToProject(projectKey);

    try {
      await navigate({
        to: isHistory ? '/view/$bookId/$chapterNumber' : '/translation/$bookId/$chapterNumber',
        params: {
          bookId: item.bookId.toString(),
          chapterNumber: item.chapterNumber.toString(),
        },
        search: {
          t: Date.now().toString(),
        },
        state: { projectItem: item },
      });
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setNavigatingToProject(null);
    }
  };

  const currentData = userDashboardTab === 'my-work' ? myWorkData : historyData;
  const isHistory = userDashboardTab === 'my-history';
  const emptyMessage = isHistory ? 'No completed work found' : 'No work assigned';

  return (
    <div className='flex h-[calc(100vh-80px)] flex-col'>
      <h2 className='text-foreground mb-6 flex-shrink-0 text-3xl font-bold'>
        Translator Dashboard
      </h2>

      <div className='mb-6 flex-shrink-0'>
        <button
          className={`cursor-pointer border-b-3 px-1 pb-3 text-sm font-medium transition-colors ${
            userDashboardTab === 'my-work'
              ? 'border-primary text-foreground'
              : 'text-foreground border-transparent hover:text-gray-700'
          }`}
          onClick={() => setUserDashboardTab('my-work')}
        >
          My Work ({myWorkData.length})
        </button>
        <button
          className={`ml-6 cursor-pointer border-b-3 px-1 pb-3 text-sm font-medium transition-colors ${
            userDashboardTab === 'my-history'
              ? 'border-primary text-foreground'
              : 'text-foreground border-transparent hover:text-gray-700'
          }`}
          onClick={() => setUserDashboardTab('my-history')}
        >
          My History ({historyData.length})
        </button>
      </div>

      <div className='bg-card flex flex-1 flex-col overflow-hidden rounded-lg border shadow'>
        {loading ? (
          <div className='flex items-center justify-center gap-2 py-12'>
            <Loader2 className='text-muted-foreground h-5 w-5 animate-spin' />
            <span className='text-muted-foreground'>Loading...</span>
          </div>
        ) : (
          <TooltipProvider delayDuration={300}>
            <div className='flex h-full flex-col overflow-y-auto'>
              <Table className='table-fixed'>
                <TableHeader className='sticky top-0 z-10'>
                  <TableRow className='bg-accent'>
                    <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                      Project
                    </TableHead>
                    <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                      Book
                    </TableHead>
                    <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                      Chapter
                    </TableHead>
                    <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-sm font-semibold tracking-wider'>
                      {isHistory ? 'Submitted Date' : 'Status'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className='divide-border divide-y bg-white'>
                  {currentData.length === 0 ? (
                    <TableRow>
                      <TableCell className='p-8 text-center text-gray-500' colSpan={4}>
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentData.map(item => {
                      const projectKey = `${item.projectUnitId}-${item.bookId}-${item.chapterNumber}`;
                      const isNavigating = navigatingToProject === projectKey;

                      return (
                        <TableRow
                          key={projectKey}
                          className='cursor-pointer transition-colors hover:bg-gray-50'
                          onClick={() => handleRowClick(item, isHistory)}
                        >
                          <TableCell className='text-popover-foreground px-6 py-4 text-sm'>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className='flex min-w-0 items-center gap-2'>
                                  {isNavigating && (
                                    <Loader2 className='h-4 w-4 flex-shrink-0 animate-spin text-[var(--primary)]' />
                                  )}
                                  <span className='truncate'>{item.projectName}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                align='start'
                                className='bg-popover text-popover-foreground border-border rounded-md border px-4 py-2.5 text-sm font-semibold whitespace-nowrap shadow-lg'
                                side='top'
                              >
                                {item.projectName}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                            {item.book}
                          </TableCell>
                          <TableCell className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                            {item.chapterNumber}
                          </TableCell>
                          <TableCell className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                            {isHistory
                              ? item.submittedTime
                                ? formatDate(item.submittedTime)
                                : 'N/A'
                              : getStatusText(item)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
