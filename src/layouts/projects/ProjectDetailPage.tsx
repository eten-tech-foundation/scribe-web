import { useMemo, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useAssignChapters, useChapterAssignments } from '@/hooks/useChapterAssignment';
import { useExportUsfm } from '@/hooks/useExportUsfm';
import { useProjectUnitBooks } from '@/hooks/useProjectUnitBooks';
import { useUsers } from '@/hooks/useUsers';
import { ViewPageHeader } from '@/layouts/projects/ViewPageHeader';
import { type User } from '@/lib/types';
import { useAppStore } from '@/store/store';

import { ExportProjectDialog } from './ExportProjectDialog';

interface ProjectDetailPageProps {
  projectId?: string;
  projectTitle: string;
  projectSourceLanguageName: string;
  projectTargetLanguageName: string;
  projectSource: string;
  onBack?: () => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projectId,
  projectTitle,
  projectSourceLanguageName,
  projectTargetLanguageName,
  projectSource,
  onBack,
}) => {
  const { userdetail } = useAppStore();

  const [selectedBook, setSelectedBook] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedAssignments, setSelectedAssignments] = useState<number[]>([]);
  const [isRefreshingAfterAssignment, setIsRefreshingAfterAssignment] = useState(false);
  const [updatingAssignmentIds, setUpdatingAssignmentIds] = useState<number[]>([]);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const {
    data: chapterAssignments,
    isLoading: assignmentsLoading,
    isFetching: assignmentsFetching,
  } = useChapterAssignments(projectId ? projectId.toString() : '0', userdetail?.email ?? '');

  const projectUnitId = useMemo(() => {
    return chapterAssignments?.[0]?.projectUnitId ?? null;
  }, [chapterAssignments]);

  const { data: books, isLoading: booksLoading } = useProjectUnitBooks(
    projectId ? projectId.toString() : '0',
    userdetail?.email ?? ''
  );

  const { data: users, isLoading: usersLoading } = useUsers(userdetail?.email ?? '');

  const getSelectedUserFullName = () => {
    if (!selectedUser || !users) return '';
    const user = users.find((u: User) => u.id.toString() === selectedUser);
    return user ? `${user.firstName} ${user.lastName}` : '';
  };

  const assignChapterMutation = useAssignChapters(
    projectId ? projectId.toString() : '0',
    userdetail?.email ?? '',
    getSelectedUserFullName()
  );

  const filteredAssignments = useMemo(() => {
    if (!chapterAssignments) return [];
    if (!selectedBook || selectedBook === 'all') return chapterAssignments;

    const selectedBookData = books?.find(book => book.bookId.toString() === selectedBook);
    if (!selectedBookData) return chapterAssignments;

    return chapterAssignments.filter(
      assignment => assignment.bookNameEng === selectedBookData.engDisplayName
    );
  }, [chapterAssignments, selectedBook, books]);

  const exportBooks = useMemo(() => {
    if (!books || !chapterAssignments) return [];

    return books.map(book => {
      const bookAssignments = chapterAssignments.filter(
        assignment => assignment.bookNameEng === book.engDisplayName
      );

      const completedChapters = bookAssignments.filter(
        assignment => assignment.completedVerses === assignment.totalVerses
      ).length;

      return {
        bookId: book.bookId,
        engDisplayName: book.engDisplayName,
        code: book.code,
        completedChapters,
        totalChapters: bookAssignments.length || 0,
      };
    });
  }, [books, chapterAssignments]);
  const exportUsfm = useExportUsfm();

  const handleExport = async (selectedBookIds: number[]) => {
    if (!projectUnitId) return;

    try {
      const zipBlob = await exportUsfm.mutateAsync({
        projectUnitId,
        bookIds: selectedBookIds,
      });

      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      const timestamp = `${year}-${month}-${day}-${hours}-${minutes}`;
      const filename = `${timestamp} ${projectTitle}.zip`;

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const formatProgress = (completedVerses: number, totalVerses: number) => {
    return `${completedVerses} of ${totalVerses}`;
  };

  const handleAddBook = () => {
    if (selectedAssignments.length > 0) {
      setIsDialogOpen(true);
    }
  };

  const handleAssignUser = async () => {
    if (selectedUser && selectedAssignments.length > 0 && userdetail?.email) {
      try {
        setUpdatingAssignmentIds(selectedAssignments);
        await assignChapterMutation.mutateAsync({
          chapterAssignmentId: selectedAssignments,
          userId: parseInt(selectedUser),
          email: userdetail.email,
        });

        setIsRefreshingAfterAssignment(true);

        setSelectedUser('');
        setSelectedAssignments([]);
        setIsDialogOpen(false);
      } catch (error) {
        console.error('Error assigning chapters:', error);
        setUpdatingAssignmentIds([]);
        setIsRefreshingAfterAssignment(false);
      }
    }
  };

  const handleCheckboxChange = (assignmentId: number, checked: boolean) => {
    setSelectedAssignments(prev =>
      checked ? [...prev, assignmentId] : prev.filter(id => id !== assignmentId)
    );
  };

  if (!projectId) {
    return (
      <div className='flex h-full items-center justify-center'>
        <span className='text-gray-500'>Project not found</span>
      </div>
    );
  }

  const headerTitle = `${projectTargetLanguageName} - ${projectTitle}`;

  const isLoadingData = assignmentsLoading || assignChapterMutation.isPending;

  const isRefreshing = isRefreshingAfterAssignment && assignmentsFetching && !assignmentsLoading;

  if (isRefreshingAfterAssignment && !assignmentsFetching) {
    setIsRefreshingAfterAssignment(false);
    setUpdatingAssignmentIds([]);
  }

  return (
    <div className='flex h-full min-w-[750px] flex-col'>
      <ViewPageHeader
        rightContent={
          <Button
            className='border-primary text-primary hover flex items-center gap-2 border-2'
            disabled={booksLoading || !books || books.length === 0}
            size='sm'
            variant={'outline'}
            onClick={() => setIsExportDialogOpen(true)}
          >
            Export Project
          </Button>
        }
        title={headerTitle}
        onBack={onBack}
      />

      <div className='flex flex-1 overflow-hidden md:gap-4 lg:gap-6'>
        {/* Project Details Card - Exactly 1/3 width */}
        <div className='w-1/3 flex-shrink-0'>
          <Card className='h-fit'>
            <CardContent className='space-y-4 py-4'>
              <div className='grid grid-cols-2 gap-2'>
                <label className='text-base font-bold'>Title</label>
                <p className='max-w-full text-base font-medium break-all text-gray-600'>
                  {projectTitle}
                </p>
                <label className='text-base font-bold'>Target Language</label>
                <p className='text-base font-medium text-gray-600'>{projectTargetLanguageName}</p>

                <label className='text-base font-bold'>Source Language</label>
                <p className='text-base font-medium text-gray-600'>{projectSourceLanguageName}</p>

                <label className='text-base font-bold'>Source Bible</label>
                <p className='text-base font-medium text-gray-600'>{projectSource}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Section - Exactly 2/3 width */}
        <div className='flex w-2/3 flex-grow flex-col overflow-hidden'>
          <div className='flex-shrink-0 pb-4 pl-[3px]'>
            <div className='flex items-center gap-3'>
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger className='my-0.5 w-[200px] lg:w-[250px]'>
                  <SelectValue placeholder={booksLoading ? 'Loading books...' : 'Book'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Books</SelectItem>
                  {books?.map(book => (
                    <SelectItem key={book.bookId} value={book.bookId.toString()}>
                      {book.engDisplayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className='flex items-center gap-2'
                disabled={selectedAssignments.length === 0 || booksLoading || isLoadingData}
                size='sm'
                onClick={handleAddBook}
              >
                {assignChapterMutation.isPending && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                Assign
              </Button>
            </div>
          </div>

          {/* Table Container with proper 2/3 width containment */}
          <div className='flex h-full flex-col overflow-hidden rounded-lg border'>
            {assignmentsLoading ? (
              <div className='flex items-center justify-center gap-2 py-8'>
                <Loader2 className='h-5 w-5 animate-spin text-gray-500' />
                <span className='text-gray-500'>Loading assignments...</span>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className='flex items-center justify-center py-8'>
                <span className='text-gray-500'>
                  {selectedBook && selectedBook !== 'all'
                    ? 'No assignments found for selected book'
                    : 'No assignments found'}
                </span>
              </div>
            ) : (
              <div className='relative flex h-full flex-col overflow-y-auto'>
                <Table>
                  <TableHeader className='sticky top-0 z-10'>
                    <TableRow className='hover:bg-transparent'>
                      <TableHead className='w-12 px-6 py-3'>
                        <></>
                      </TableHead>
                      <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-base font-semibold tracking-wider'>
                        Book
                      </TableHead>
                      <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-base font-semibold tracking-wider'>
                        Chapter
                      </TableHead>
                      <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-base font-semibold tracking-wider'>
                        Assigned
                      </TableHead>
                      <TableHead className='text-accent-foreground w-1/4 px-6 py-3 text-left text-base font-semibold tracking-wider'>
                        Progress
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className='divide-border divide-y'>
                    {filteredAssignments.map(assignment => {
                      const isUpdatingThisAssignment =
                        isRefreshing && updatingAssignmentIds.includes(assignment.assignmentId);

                      return (
                        <TableRow
                          key={assignment.assignmentId}
                          className='align-center cursor-pointer border-b transition-colors hover:bg-gray-50'
                        >
                          <TableCell className='w-12 px-6 py-4'>
                            <Checkbox
                              checked={selectedAssignments.includes(assignment.assignmentId)}
                              disabled={isLoadingData}
                              onCheckedChange={checked =>
                                handleCheckboxChange(assignment.assignmentId, !!checked)
                              }
                            />
                          </TableCell>
                          <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-base'>
                            <div className='truncate' title={assignment.bookNameEng}>
                              {assignment.bookNameEng}
                            </div>
                          </TableCell>
                          <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-base whitespace-nowrap'>
                            {assignment.chapterNumber}
                          </TableCell>
                          <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-base'>
                            <div className='flex items-center gap-2'>
                              {isUpdatingThisAssignment ? (
                                <>
                                  <span className='text-gray-500'>Loading...</span>
                                  <Loader2 className='h-4 w-4 animate-spin text-gray-500' />
                                </>
                              ) : (
                                <div
                                  className='truncate'
                                  title={`${assignment.assignedUser?.displayName}`}
                                >
                                  {assignment.assignedUser?.displayName}{' '}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className='text-popover-foreground w-1/4 px-6 py-4 text-base'>
                            <div
                              className='truncate'
                              title={formatProgress(
                                assignment.completedVerses,
                                assignment.totalVerses
                              )}
                            >
                              {formatProgress(assignment.completedVerses, assignment.totalVerses)}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='sm:max-w-md' onInteractOutside={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Assign User</DialogTitle>
          </DialogHeader>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className='w-full bg-white'>
              <SelectValue placeholder={usersLoading ? 'Loading users...' : 'Select a User'} />
            </SelectTrigger>
            <SelectContent>
              {users
                ?.filter((user: User) => user.role === 2)
                .map((user: User) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.username}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <DialogFooter className='flex gap-2'>
            <Button
              disabled={!selectedUser || usersLoading || assignChapterMutation.isPending}
              onClick={handleAssignUser}
            >
              {assignChapterMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Assigning...
                </>
              ) : (
                'Assign User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExportProjectDialog
        books={exportBooks}
        isLoading={booksLoading}
        isOpen={isExportDialogOpen}
        projectName={projectTitle}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
};
