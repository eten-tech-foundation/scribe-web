import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useAssignChapters, useChapterAssignments } from '@/hooks/useChapterAssignment';
import { useProjectUnitBooks } from '@/hooks/useProjectUnitBooks';
import { useUsers } from '@/hooks/useUsers';
import { ViewPageHeader } from '@/layouts/projects/ViewPageHeader';
import { getStatusDisplay } from '@/lib/formatters';
import { UserRole, type ChapterAssignmentStatus, type User } from '@/lib/types';
import { useAppStore } from '@/store/store';

import { AssignUsersDialog } from './AssignUsersDialog';

interface ProjectDetailPageProps {
  projectId?: number | null;
  projectTitle: string;
  projectSourceLanguageName: string;
  projectTargetLanguageName: string;
  projectSource: string;
  onBack?: () => void;
  onExport?: () => void;
}

const TruncatedCardText = ({ text }: { text: string }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
      }
    };

    checkTruncation();
    let timeoutId: NodeJS.Timeout;
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkTruncation, 150);
    };
    window.addEventListener('resize', debouncedCheck);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedCheck);
    };
  }, [text]);

  const content = (
    <div
      ref={textRef}
      className='max-w-full cursor-default truncate text-base font-medium text-gray-600 dark:text-gray-400'
    >
      {text}
    </div>
  );

  if (!isTruncated) return content;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent
          align='center'
          className='bg-popover text-popover-foreground border-border max-w-[350px] rounded-md border px-4 py-2.5 text-sm font-semibold break-all shadow-lg'
          side='bottom'
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const TruncatedTableText = ({ text }: { text: string }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
      }
    };

    checkTruncation();
    let timeoutId: NodeJS.Timeout;
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkTruncation, 150);
    };
    window.addEventListener('resize', debouncedCheck);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedCheck);
    };
  }, [text]);

  const content = (
    <div ref={textRef} className='max-w-full cursor-default truncate' title=''>
      {text}
    </div>
  );

  if (!isTruncated) return content;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent
          align='center'
          className='bg-popover text-popover-foreground border-border rounded-md border px-4 py-2.5 text-sm font-semibold whitespace-nowrap shadow-lg'
          side='top'
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projectId,
  projectTitle,
  projectSourceLanguageName,
  projectTargetLanguageName,
  projectSource,
  onBack,
  onExport,
}) => {
  const { userdetail } = useAppStore();

  const [selectedBook, setSelectedBook] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDrafter, setSelectedDrafter] = useState<string>('');
  const [selectedPeerChecker, setSelectedPeerChecker] = useState<string>('');
  const [selectedAssignments, setSelectedAssignments] = useState<number[]>([]);
  const [selectedAssignmentsStatuses, setSelectedAssignmentsStatuses] = useState<string[]>([]);
  const [isRefreshingAfterAssignment, setIsRefreshingAfterAssignment] = useState(false);
  const [updatingAssignmentIds, setUpdatingAssignmentIds] = useState<number[]>([]);

  const {
    data: chapterAssignments,
    isLoading: assignmentsLoading,
    isFetching: assignmentsFetching,
  } = useChapterAssignments(projectId ? projectId.toString() : '0', userdetail?.email ?? '');

  const { data: books, isLoading: booksLoading } = useProjectUnitBooks(
    projectId ? projectId.toString() : '0',
    userdetail?.email ?? ''
  );

  const { data: users, isLoading: usersLoading } = useUsers(userdetail?.email ?? '');

  const getSelectedUserFullName = useCallback(
    (userId: string) => {
      if (!userId || !users) return '';
      const user = users.find((u: User) => u.id.toString() === userId);
      return user ? `${user.firstName} ${user.lastName}` : '';
    },
    [users]
  );

  const assignChapterMutation = useAssignChapters(
    projectId ? projectId.toString() : '0',
    userdetail?.email ?? '',
    getSelectedUserFullName(selectedDrafter)
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

  const formatProgress = useCallback((completedVerses: number, totalVerses: number) => {
    return `${completedVerses} of ${totalVerses}`;
  }, []);

  const handleAddBook = useCallback(() => {
    if (selectedAssignments.length > 0) {
      const firstSelectedAssignment = chapterAssignments?.find(
        assignment => assignment.assignmentId === selectedAssignments[0]
      );

      const statuses =
        chapterAssignments
          ?.filter(assignment => selectedAssignments.includes(assignment.assignmentId))
          .map(assignment => assignment.status) ?? [];

      setSelectedAssignmentsStatuses(statuses);

      if (firstSelectedAssignment) {
        const drafterUser = users?.find(
          (u: User) => u.username === firstSelectedAssignment.assignedUser?.displayName
        );
        const peerCheckerUser = users?.find(
          (u: User) => u.username === firstSelectedAssignment.peerChecker?.displayName
        );

        setSelectedDrafter(drafterUser ? drafterUser.id.toString() : '');
        setSelectedPeerChecker(peerCheckerUser ? peerCheckerUser.id.toString() : '');
      }

      setIsDialogOpen(true);
    }
  }, [selectedAssignments, chapterAssignments, users]);

  const handleAssignUser = useCallback(async () => {
    if (selectedDrafter && selectedAssignments.length > 0 && userdetail?.email) {
      try {
        setUpdatingAssignmentIds(selectedAssignments);
        await assignChapterMutation.mutateAsync({
          chapterAssignmentId: selectedAssignments,
          userId: parseInt(selectedDrafter),
          peerCheckerId: parseInt(selectedPeerChecker),
          email: userdetail.email,
        });

        setIsRefreshingAfterAssignment(true);

        setSelectedDrafter('');
        setSelectedPeerChecker('');
        setSelectedAssignments([]);
        setSelectedAssignmentsStatuses([]);
        setIsDialogOpen(false);
      } catch (error) {
        console.error('Error assigning chapters:', error);
        setUpdatingAssignmentIds([]);
        setIsRefreshingAfterAssignment(false);
      }
    }
  }, [
    selectedDrafter,
    selectedPeerChecker,
    selectedAssignments,
    userdetail?.email,
    assignChapterMutation,
  ]);

  const handleCheckboxChange = useCallback((assignmentId: number, checked: boolean) => {
    setSelectedAssignments(prev =>
      checked ? [...prev, assignmentId] : prev.filter(id => id !== assignmentId)
    );
  }, []);

  const availablePeerCheckers = useMemo(() => {
    if (!users) return [];
    return users.filter(
      (user: User) => user.role === UserRole.TRANSLATOR && user.id.toString() !== selectedDrafter
    );
  }, [users, selectedDrafter]);

  if (!projectId) {
    return (
      <div className='flex h-full items-center justify-center'>
        <span>Project not found</span>
      </div>
    );
  }

  const headerTitle = `${projectTargetLanguageName} - ${projectTitle}`;

  const isLoadingData = assignmentsLoading || assignChapterMutation.isPending;

  const isRefreshing = isRefreshingAfterAssignment && assignmentsFetching && !assignmentsLoading;
  const isDisabled = booksLoading || !books?.length || !chapterAssignments?.length;

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
            disabled={isDisabled}
            size='sm'
            variant={'outline'}
            onClick={onExport}
          >
            Export Project
          </Button>
        }
        title={headerTitle}
        onBack={onBack}
      />

      <div className='flex flex-1 overflow-hidden md:gap-4 lg:gap-6'>
        {/* Project Details Card - Exactly 1/4 width */}
        <div className='w-1/4 flex-shrink-0'>
          <Card className='h-fit'>
            <CardContent className='space-y-4 py-4'>
              <div className='grid grid-cols-2 gap-2'>
                <label className='text-base font-bold'>Title</label>
                <TruncatedCardText text={projectTitle} />
                <label className='text-base font-bold'>Target Language</label>
                <p className='text-base font-medium text-gray-600 dark:text-gray-400'>
                  {projectTargetLanguageName}
                </p>

                <label className='text-base font-bold'>Source Language</label>
                <p className='text-base font-medium text-gray-600 dark:text-gray-400'>
                  {projectSourceLanguageName}
                </p>

                <label className='text-base font-bold'>Source Bible</label>
                <p className='text-base font-medium text-gray-600 dark:text-gray-400'>
                  {projectSource}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Section - Exactly 2/3 width */}
        <div className='flex w-3/4 flex-grow flex-col overflow-hidden'>
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
                <span>
                  {selectedBook && selectedBook !== 'all'
                    ? 'No assignments found for selected book'
                    : 'No assignments found'}
                </span>
              </div>
            ) : (
              <TooltipProvider delayDuration={300}>
                <div className='relative flex h-full flex-col overflow-y-auto'>
                  <Table className='w-full table-fixed'>
                    <TableHeader className='sticky top-0 z-10'>
                      <TableRow className='hover:bg-transparent'>
                        <TableHead className='w-12 px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3'>
                          <></>
                        </TableHead>
                        <TableHead className='text-accent-foreground px-3 py-2 text-left text-xs font-semibold tracking-wider md:px-4 md:py-2.5 md:text-sm lg:px-6 lg:py-3 lg:text-base'>
                          Book
                        </TableHead>
                        <TableHead className='text-accent-foreground px-3 py-2 text-left text-xs font-semibold tracking-wider md:px-4 md:py-2.5 md:text-sm lg:px-6 lg:py-3 lg:text-base'>
                          Chapter
                        </TableHead>
                        <TableHead className='text-accent-foreground px-3 py-2 text-left text-xs font-semibold tracking-wider md:px-4 md:py-2.5 md:text-sm lg:px-6 lg:py-3 lg:text-base'>
                          Drafter
                        </TableHead>
                        <TableHead className='text-accent-foreground px-3 py-2 text-left text-xs font-semibold tracking-wider md:px-4 md:py-2.5 md:text-sm lg:px-6 lg:py-3 lg:text-base'>
                          <TruncatedTableText text='Peer Checker' />
                        </TableHead>
                        <TableHead className='text-accent-foreground px-3 py-2 text-left text-xs font-semibold tracking-wider md:px-4 md:py-2.5 md:text-sm lg:px-6 lg:py-3 lg:text-base'>
                          Status
                        </TableHead>
                        <TableHead className='text-accent-foreground px-3 py-2 text-left text-xs font-semibold tracking-wider md:px-4 md:py-2.5 md:text-sm lg:px-6 lg:py-3 lg:text-base'>
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
                            className='align-center cursor-pointer border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
                          >
                            <TableCell className='w-12 px-3 py-3 md:px-4 md:py-3.5 lg:px-6 lg:py-4'>
                              <Checkbox
                                checked={selectedAssignments.includes(assignment.assignmentId)}
                                disabled={isLoadingData}
                                onCheckedChange={checked =>
                                  handleCheckboxChange(assignment.assignmentId, !!checked)
                                }
                              />
                            </TableCell>
                            <TableCell className='text-popover-foreground px-3 py-3 text-xs md:px-4 md:py-3.5 md:text-sm lg:px-6 lg:py-4 lg:text-base'>
                              <TruncatedTableText text={assignment.bookNameEng} />
                            </TableCell>
                            <TableCell className='text-popover-foreground px-3 py-3 text-xs whitespace-nowrap md:px-4 md:py-3.5 md:text-sm lg:px-6 lg:py-4 lg:text-base'>
                              {assignment.chapterNumber}
                            </TableCell>
                            <TableCell className='text-popover-foreground px-3 py-3 text-xs md:px-4 md:py-3.5 md:text-sm lg:px-6 lg:py-4 lg:text-base'>
                              {isUpdatingThisAssignment ? (
                                <div className='flex items-center gap-1.5 md:gap-2'>
                                  <span>Loading...</span>
                                  <Loader2 className='h-3 w-3 animate-spin md:h-4 md:w-4' />
                                </div>
                              ) : (
                                <TruncatedTableText
                                  text={assignment.assignedUser?.displayName ?? ''}
                                />
                              )}
                            </TableCell>
                            <TableCell className='text-popover-foreground px-3 py-3 text-xs md:px-4 md:py-3.5 md:text-sm lg:px-6 lg:py-4 lg:text-base'>
                              {isUpdatingThisAssignment ? (
                                <div className='flex items-center gap-1.5 md:gap-2'>
                                  <span>Loading...</span>
                                  <Loader2 className='h-3 w-3 animate-spin md:h-4 md:w-4' />
                                </div>
                              ) : (
                                <TruncatedTableText
                                  text={assignment.peerChecker?.displayName ?? ''}
                                />
                              )}
                            </TableCell>
                            <TableCell className='text-popover-foreground px-3 py-3 text-xs whitespace-nowrap md:px-4 md:py-3.5 md:text-sm lg:px-6 lg:py-4 lg:text-base'>
                              <TruncatedTableText
                                text={getStatusDisplay(
                                  assignment.status as ChapterAssignmentStatus
                                )}
                              />
                            </TableCell>
                            <TableCell className='text-popover-foreground px-3 py-3 text-xs md:px-4 md:py-3.5 md:text-sm lg:px-6 lg:py-4 lg:text-base'>
                              <TruncatedTableText
                                text={formatProgress(
                                  assignment.completedVerses,
                                  assignment.totalVerses
                                )}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>

      <AssignUsersDialog
        availablePeerCheckers={availablePeerCheckers}
        isAssigning={assignChapterMutation.isPending}
        isOpen={isDialogOpen}
        selectedAssignmentsStatuses={selectedAssignmentsStatuses}
        selectedDrafter={selectedDrafter}
        selectedPeerChecker={selectedPeerChecker}
        users={users}
        usersLoading={usersLoading}
        onAssign={handleAssignUser}
        onClose={() => setIsDialogOpen(false)}
        onDrafterChange={setSelectedDrafter}
        onPeerCheckerChange={setSelectedPeerChecker}
      />
    </div>
  );
};
