import { useLayoutEffect, useRef, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChapterAssignmentStatus, UserRole, type User } from '@/lib/types';

interface AssignUsersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDrafter: string;
  selectedPeerChecker: string;
  onDrafterChange: (value: string) => void;
  onPeerCheckerChange: (value: string) => void;
  users: User[] | undefined;
  availablePeerCheckers: User[];
  usersLoading: boolean;
  isAssigning: boolean;
  onAssign: () => void;
  selectedAssignmentsStatuses: string[];
}

const TruncatedDropdownText = ({ text, className }: { text: string; className?: string }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [text]);

  const content = (
    <div ref={textRef} className={`cursor-default truncate ${className ?? ''}`}>
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
          className='bg-popover text-popover-foreground border-border max-w-[350px] rounded-md border text-center text-sm font-semibold break-words shadow-lg'
          side='top'
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const AssignUsersDialog: React.FC<AssignUsersDialogProps> = ({
  isOpen,
  onClose,
  selectedDrafter,
  selectedPeerChecker,
  onDrafterChange,
  onPeerCheckerChange,
  users,
  availablePeerCheckers,
  usersLoading,
  isAssigning,
  onAssign,
  selectedAssignmentsStatuses,
}) => {
  const hasPeerCheckStatus = selectedAssignmentsStatuses.some(
    status => status === ChapterAssignmentStatus.PEER_CHECK
  );
  const hasCommunityReviewStatus = selectedAssignmentsStatuses.some(
    status => status === ChapterAssignmentStatus.COMMUNITY_REVIEW
  );

  const isDrafterDisabled = hasPeerCheckStatus || hasCommunityReviewStatus;

  const isPeerCheckerDisabled = hasCommunityReviewStatus;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Assign Users</DialogTitle>
        </DialogHeader>
        <div>
          <div className='mt-1 mb-2 flex items-center gap-1'>
            <span className='text-sm text-red-500'>*</span>
            <label className='block text-sm font-medium'>Drafter</label>
          </div>
          <Select
            disabled={isDrafterDisabled || usersLoading}
            value={selectedDrafter}
            onValueChange={onDrafterChange}
          >
            <SelectTrigger className='w-full bg-white'>
              <SelectValue placeholder={usersLoading ? 'Loading users...' : 'Select a User'}>
                {selectedDrafter ? (
                  <div className='flex w-full'>
                    <TruncatedDropdownText
                      className='w-full max-w-[280px] text-left sm:max-w-[350px]'
                      text={users?.find(u => u.id.toString() === selectedDrafter)?.username ?? ''}
                    />
                  </div>
                ) : (
                  <span className='text-muted-foreground'>
                    {usersLoading
                      ? 'Loading users...'
                      : isDrafterDisabled
                        ? 'Cannot modify drafter for this status'
                        : 'Select a User'}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {users
                ?.filter((user: User) => user.role === UserRole.TRANSLATOR)
                .map((user: User) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    <div className='w-[250px] sm:w-[350px]'>
                      <TruncatedDropdownText text={user.username} />
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className='mb-2 flex items-center gap-1'>
            <span className='text-sm text-red-500'>*</span>
            <label className='block text-sm font-medium'>Peer Checker</label>
          </div>
          <Select
            disabled={isPeerCheckerDisabled || usersLoading}
            value={selectedPeerChecker}
            onValueChange={onPeerCheckerChange}
          >
            <SelectTrigger className='w-full bg-white'>
              <SelectValue placeholder={usersLoading ? 'Loading users...' : 'Select a User'}>
                {selectedPeerChecker ? (
                  <div className='flex w-full'>
                    <TruncatedDropdownText
                      className='w-full max-w-[280px] text-left sm:max-w-[350px]'
                      text={
                        users?.find(u => u.id.toString() === selectedPeerChecker)?.username ?? ''
                      }
                    />
                  </div>
                ) : (
                  <span className='text-muted-foreground'>
                    {usersLoading
                      ? 'Loading users...'
                      : isPeerCheckerDisabled
                        ? 'Cannot modify peer checker for this status'
                        : 'Select a User'}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availablePeerCheckers.map((user: User) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  <div className='w-[250px] sm:w-[350px]'>
                    <TruncatedDropdownText text={user.username} />
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className='flex gap-2'>
          <Button
            disabled={!selectedDrafter || !selectedPeerChecker || usersLoading || isAssigning}
            onClick={onAssign}
          >
            {isAssigning ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Assigning...
              </>
            ) : (
              'Assign Users'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
