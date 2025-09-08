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
import type { HistoryItem, WorkItem } from '@/lib/types';
import { useAppStore } from '@/store/store';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function UserHomePage() {
  const [activeTab, setActiveTab] = useState<'my-work' | 'my-history'>('my-work');
  const { userdetail } = useAppStore();

  const { data: projectData = [], isLoading: loading } = useChapterAssignments(
    userdetail?.email ?? ''
  );

  const myWorkData: WorkItem[] = projectData
    .filter(item => !item.is_submitted)
    .map(item => {
      const [completed, total] = item.progress.split(' of ').map(Number);
      return {
        id: `${item.project_unit_id}-${item.book_id}-${item.chapter_number}`,
        project: item.project_name,
        book: item.book,
        chapter: item.chapter_number.toString(),
        status: item.progress,
        completedVerses: completed,
        totalVerses: total,
      };
    });

  const historyData: HistoryItem[] = projectData
    .filter(item => item.is_submitted && item.submitted_time)
    .map(item => ({
      id: `${item.project_unit_id}-${item.book_id}-${item.chapter_number}`,
      project: item.project_name,
      book: item.book,
      chapter: item.chapter_number,
      date: item.submitted_time ?? '',
    }));

  const sortedWorkData = [...myWorkData].sort((a, b) => {
    const aCompleted = a.completedVerses === a.totalVerses;
    const bCompleted = b.completedVerses === b.totalVerses;

    if (aCompleted && !bCompleted) return -1;
    if (!aCompleted && bCompleted) return 1;

    if (a.book !== b.book) return a.book.localeCompare(b.book);
    return a.chapter.localeCompare(b.chapter);
  });

  const sortedHistoryData = [...historyData].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div>
      <div className='flex h-[calc(100vh-80px)] flex-col p-6'>
        <h2 className='mb-6 flex-shrink-0 text-2xl font-medium text-gray-900'>
          Translator Dashboard
        </h2>

        <div className='mb-6 flex-shrink-0'>
          <div className='flex gap-8 border-b border-gray-200'>
            <button
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'my-work'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('my-work')}
            >
              My Work ({myWorkData.length})
            </button>
            <button
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'my-history'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('my-history')}
            >
              My History ({historyData.length})
            </button>
          </div>
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
                        {sortedWorkData.length === 0 ? (
                          <TableRow>
                            <TableCell className='p-8 text-center text-gray-500' colSpan={4}>
                              No work items found
                            </TableCell>
                          </TableRow>
                        ) : (
                          sortedWorkData.map(item => (
                            <TableRow
                              key={item.id}
                              className='border-b border-gray-100 hover:bg-gray-50'
                            >
                              <TableCell className='w-1/4 px-6 py-4 text-gray-900'>
                                {item.project}
                              </TableCell>
                              <TableCell className='w-1/4 px-6 py-4 text-gray-900'>
                                {item.book}
                              </TableCell>
                              <TableCell className='w-1/4 px-6 py-4 text-gray-900'>
                                {item.chapter}
                              </TableCell>
                              <TableCell className='w-1/4 px-6 py-4 text-gray-900'>
                                {item.status}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </>
                    )}

                    {activeTab === 'my-history' && (
                      <>
                        {sortedHistoryData.length === 0 ? (
                          <TableRow>
                            <TableCell className='p-8 text-center text-gray-500' colSpan={4}>
                              No history items found
                            </TableCell>
                          </TableRow>
                        ) : (
                          sortedHistoryData.map(item => (
                            <TableRow
                              key={item.id}
                              className='border-b border-gray-100 hover:bg-gray-50'
                            >
                              <TableCell className='w-1/4 px-6 py-4 text-gray-900'>
                                {item.project}
                              </TableCell>
                              <TableCell className='w-1/4 px-6 py-4 text-gray-900'>
                                {item.book}
                              </TableCell>
                              <TableCell className='w-1/4 px-6 py-4 text-gray-900'>
                                {item.chapter}
                              </TableCell>
                              <TableCell className='w-1/4 px-6 py-4 text-gray-900'>
                                {formatDate(item.date)}
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
