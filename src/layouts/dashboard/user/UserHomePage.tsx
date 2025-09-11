import { useState } from 'react';

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
  const { userdetail } = useAppStore();

  const { data: projectData = [], isLoading: loading } = useChapterAssignments(userdetail as User);

  const myWorkData: ProjectItem[] = projectData
    .filter(item => !item.isSubmitted)
    .sort((a, b) => {
      const aHasCompleted = a.completedVerses > 0;
      const bHasCompleted = b.completedVerses > 0;

      if (aHasCompleted && !bHasCompleted) return -1;
      if (!aHasCompleted && bHasCompleted) return 1;

      if (a.book !== b.book) return a.book.localeCompare(b.book);

      return a.chapterNumber - b.chapterNumber;
    });

  const historyData: ProjectItem[] = projectData
    .filter(item => item.isSubmitted && item.submittedTime)
    .sort((a, b) => {
      const dateA = a.submittedTime ? new Date(a.submittedTime).getTime() : 0;
      const dateB = b.submittedTime ? new Date(b.submittedTime).getTime() : 0;
      return dateB - dateA;
    });

  const handleRowClick = (item: ProjectItem) => {
    console.log('Selected item:', item);
  };

  return (
    <div>
      <div className='flex h-[calc(100vh-80px)] flex-col p-6'>
        <h2 className='mb-6 flex-shrink-0 text-2xl font-medium text-gray-900'>
          Translator Dashboard
        </h2>

        <div className='mb-6 flex-shrink-0'>
          <button
            className={`border-b-3 px-1 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'my-work'
                ? 'border-primary text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('my-work')}
          >
            My Work ({myWorkData.length})
          </button>
          <button
            className={`ml-6 border-b-3 px-1 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'my-history'
                ? 'border-primary text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('my-history')}
          >
            My History ({historyData.length})
          </button>
        </div>

        <div className='flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white'>
          {loading ? (
            <div className='flex items-center justify-center gap-2 py-12'>
              <Loader2 className='h-5 w-5 animate-spin text-gray-500' />
              <span className='text-gray-500'>Loading...</span>
            </div>
          ) : (
            <div className='flex h-full flex-col overflow-hidden'>
              <div className='flex-shrink-0'>
                <Table className='table-fixed'>
                  <TableHeader className='sticky top-0 z-10'>
                    <TableRow className='border-b border-gray-200 bg-gray-100'>
                      <TableHead className='w-1/4 px-6 py-4 font-medium text-gray-700'>
                        Project
                      </TableHead>
                      <TableHead className='w-1/4 px-6 py-4 font-medium text-gray-700'>
                        Book
                      </TableHead>
                      <TableHead className='w-1/4 px-6 py-4 font-medium text-gray-700'>
                        Chapter
                      </TableHead>
                      <TableHead className='w-1/4 px-6 py-4 font-medium text-gray-700'>
                        {activeTab === 'my-work' ? 'Status' : 'Date'}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>

              <div className='flex-1 overflow-y-auto'>
                <Table className='table-fixed'>
                  <TableBody>
                    {activeTab === 'my-work' && (
                      <>
                        {myWorkData.length === 0 ? (
                          <TableRow>
                            <TableCell className='p-8 text-center text-gray-500' colSpan={4}>
                              No work assigned
                            </TableCell>
                          </TableRow>
                        ) : (
                          myWorkData.map(item => (
                            <TableRow
                              key={`${item.projectUnitId}-${item.bookId}-${item.chapterNumber}`}
                              className='cursor-pointer border-b border-gray-100 hover:bg-gray-50'
                              onClick={() => handleRowClick(item)}
                            >
                              <TableCell className='w-1/4 px-6 py-4 text-gray-900'>
                                {item.projectName}
                              </TableCell>
                              <TableCell className='w-1/4 px-6 py-4 text-gray-900'>
                                {item.book}
                              </TableCell>
                              <TableCell className='w-1/4 px-6 py-4 text-gray-900'>
                                {item.chapterNumber}
                              </TableCell>
                              <TableCell className='w-1/4 px-6 py-4 text-gray-900'>
                                {getStatusText(item)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </>
                    )}

                    {activeTab === 'my-history' && (
                      <>
                        {historyData.length === 0 ? (
                          <TableRow>
                            <TableCell className='p-8 text-center text-gray-500' colSpan={4}>
                              No history available
                            </TableCell>
                          </TableRow>
                        ) : (
                          historyData.map(item => (
                            <TableRow
                              key={`${item.projectUnitId}-${item.bookId}-${item.chapterNumber}`}
                              className='cursor-pointer border-b border-gray-100 hover:bg-gray-50'
                              onClick={() => handleRowClick(item)}
                            >
                              <TableCell className='w-1/4 px-6 py-4 text-gray-900'>
                                {item.projectName}
                              </TableCell>
                              <TableCell className='w-1/4 px-6 py-4 text-gray-900'>
                                {item.book}
                              </TableCell>
                              <TableCell className='w-1/4 px-6 py-4 text-gray-900'>
                                {item.chapterNumber}
                              </TableCell>
                              <TableCell className='w-1/4 px-6 py-4 text-gray-900'>
                                {item.submittedTime ? formatDate(item.submittedTime) : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
