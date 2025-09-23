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
  const [activeTab, setActiveTab] = useState<'my-work' | 'my-history'>('my-work');
  const [navigatingToProject, setNavigatingToProject] = useState<string | null>(null);
  const { userdetail } = useAppStore();
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

  const handleRowClick = async (item: ProjectItem) => {
    const projectKey = `${item.projectUnitId}-${item.bookId}-${item.chapterNumber}`;
    setNavigatingToProject(projectKey);

    try {
      await navigate({
        to: '/translation/$bookId/$chapterNumber',
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

  return (
    <div className='flex h-[calc(100vh-80px)] flex-col'>
      <h2 className='text-foreground mb-6 flex-shrink-0 text-3xl font-bold'>
        Translator Dashboard
      </h2>

      <div className='mb-6 flex-shrink-0'>
        <button
          className={`cursor-pointer border-b-3 px-1 pb-3 text-sm font-medium transition-colors ${
            activeTab === 'my-work'
              ? 'border-primary text-foreground'
              : 'text-foreground border-transparent hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('my-work')}
        >
          My Work ({myWorkData.length})
        </button>
        <button
          className={`ml-6 cursor-pointer border-b-3 px-1 pb-3 text-sm font-medium transition-colors ${
            activeTab === 'my-history'
              ? 'border-primary text-foreground'
              : 'text-foreground border-transparent hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('my-history')}
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
          <div className='flex h-full flex-col overflow-hidden'>
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
                    {activeTab === 'my-work' ? 'Status' : 'Submitted Date'}
                  </TableHead>
                </TableRow>
              </TableHeader>
            </Table>

            <div className='scrollbar-thin flex-1 overflow-y-auto'>
              <Table className='table-fixed'>
                <TableBody className='divide-border divide-y bg-white'>
                  {activeTab === 'my-work' &&
                    (myWorkData.length === 0 ? (
                      <TableRow>
                        <TableCell className='p-8 text-center text-gray-500' colSpan={4}>
                          No work assigned
                        </TableCell>
                      </TableRow>
                    ) : (
                      myWorkData.map(item => {
                        const projectKey = `${item.projectUnitId}-${item.bookId}-${item.chapterNumber}`;
                        const isNavigating = navigatingToProject === projectKey;

                        return (
                          <TableRow
                            key={projectKey}
                            className='cursor-pointer transition-colors hover:bg-gray-50'
                            onClick={() => handleRowClick(item)}
                          >
                            <TableCell className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                              <div className='flex items-center gap-2'>
                                {isNavigating && (
                                  <Loader2 className='h-4 w-4 animate-spin text-[var(--primary)]' />
                                )}
                                {item.projectName}
                              </div>
                            </TableCell>
                            <TableCell className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                              {item.book}
                            </TableCell>
                            <TableCell className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                              {item.chapterNumber}
                            </TableCell>
                            <TableCell className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                              {getStatusText(item)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ))}

                  {activeTab === 'my-history' &&
                    (historyData.length === 0 ? (
                      <TableRow>
                        <TableCell className='p-8 text-center text-gray-500' colSpan={4}>
                          No completed work found
                        </TableCell>
                      </TableRow>
                    ) : (
                      historyData.map(item => (
                        <TableRow
                          key={`${item.projectUnitId}-${item.bookId}-${item.chapterNumber}`}
                          className='transition-colors hover:bg-gray-50'
                        >
                          <TableCell className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                            {item.projectName}
                          </TableCell>
                          <TableCell className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                            {item.book}
                          </TableCell>
                          <TableCell className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                            {item.chapterNumber}
                          </TableCell>
                          <TableCell className='text-popover-foreground px-6 py-4 text-sm whitespace-nowrap'>
                            {item.submittedTime ? formatDate(item.submittedTime) : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
