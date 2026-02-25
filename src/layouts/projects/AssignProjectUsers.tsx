import { useCallback, useMemo, useState } from 'react';

import { Loader2, Plus, Trash2, TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { useAddProjectUser, useProjectUsers, useRemoveProjectUser } from '@/hooks/useProjectUsers';
import { TruncatedDropdownText } from '@/layouts/projects/AssignUsersDialog';
import { type User } from '@/lib/types';

interface AssignProjectUsersProps {
  projectId: number;
  email: string;
  users: User[] | undefined;
  usersLoading: boolean;
}

export const AssignProjectUsers: React.FC<AssignProjectUsersProps> = ({
  projectId,
  email,
  users,
  usersLoading,
}) => {
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { data: projectUsers, isLoading: projectUsersLoading } = useProjectUsers(projectId, email, {
    enabled: !!projectId && !!email,
  });

  const addProjectUserMutation = useAddProjectUser(projectId, email);
  const removeProjectUserMutation = useRemoveProjectUser(projectId, email);

  const availableUsersToAdd = useMemo(() => {
    if (!users || !projectUsers) return users ?? [];
    const projectUserIds = new Set(projectUsers.map(pu => pu.userId));
    return users.filter((u: User) => !projectUserIds.has(u.id));
  }, [users, projectUsers]);

  const handleOpenAddDialog = useCallback(() => {
    setError(null);
    setSelectedUserToAdd('');
    setIsAddUserDialogOpen(true);
  }, []);

  const handleAddProjectUser = useCallback(async () => {
    if (!selectedUserToAdd) return;
    setError(null);
    try {
      await addProjectUserMutation.mutateAsync({ userId: parseInt(selectedUserToAdd) });
      setIsAddUserDialogOpen(false);
      setSelectedUserToAdd('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error: User not added.';
      setError(message);
    }
  }, [selectedUserToAdd, addProjectUserMutation]);

  const handleRemoveProjectUser = useCallback(
    async (userId: number) => {
      setError(null);
      try {
        await removeProjectUserMutation.mutateAsync({ userId });
      } catch (err: unknown) {
        const message =
          err instanceof Error && err.message.includes('still has content')
            ? 'Error: User still has assigned content.'
            : 'Error: User not removed.';
        setError(message);
      }
    },
    [removeProjectUserMutation]
  );

  return (
    <>
      <div className='flex flex-col'>
        {/* Title row */}
        <div className='mb-3 flex items-center justify-between'>
          <h3 className='text-lg font-bold'>Project Users</h3>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className='bg-primary h-8 w-8 rounded-sm p-0 text-white'
                  size='sm'
                  onClick={handleOpenAddDialog}
                >
                  <Plus className='h-4 w-4' strokeWidth={2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side='top'>Add user to project</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Error message */}
        {error && (
          <div className='mb-2 flex items-center gap-1.5 text-sm text-red-500'>
            <TriangleAlert className='h-4 w-4 flex-shrink-0' />
            <span>{error}</span>
          </div>
        )}

        {/* Users table */}
        <Card>
          <CardContent className='p-0'>
            <div className='max-h-[235px] overflow-y-auto'>
              <Table>
                <TableHeader className='sticky top-0 z-10'>
                  <TableRow className='hover:bg-transparent'>
                    <TableHead className='py-2 pl-3 text-sm font-semibold'>Name</TableHead>
                    <TableHead className='w-10 py-2 pr-3' />
                  </TableRow>
                </TableHeader>
                <TableBody className='bg-white'>
                  {projectUsersLoading ? (
                    <TableRow>
                      <TableCell className='py-4 text-center' colSpan={2}>
                        <Loader2 className='mx-auto h-4 w-4 animate-spin text-gray-400' />
                      </TableCell>
                    </TableRow>
                  ) : !projectUsers?.length ? (
                    <TableRow>
                      <TableCell className='py-4 text-center text-sm text-gray-400' colSpan={2}>
                        No users added yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    projectUsers.map(pu => (
                      <TableRow key={pu.userId} className='hover:bg-gray-50 dark:hover:bg-gray-800'>
                        <TableCell className='py-2.5 pl-3 text-sm'>{pu.displayName}</TableCell>
                        <TableCell className='py-2.5 pr-3 text-right'>
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className='h-7 w-7 p-0 hover:text-red-500'
                                  disabled={removeProjectUserMutation.isPending}
                                  size='sm'
                                  variant='ghost'
                                  onClick={() => handleRemoveProjectUser(pu.userId)}
                                >
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side='top'>Remove user from project</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Project User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className='w-[420px] max-w-[90vw]'>
          <DialogHeader>
            <DialogTitle>Add Project User</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-6 pt-2'>
            <Select value={selectedUserToAdd} onValueChange={setSelectedUserToAdd}>
              <SelectTrigger className='w-full bg-white'>
                <SelectValue placeholder='Select a User' />
              </SelectTrigger>
              <SelectContent className='w-[var(--radix-select-trigger-width)]'>
                {usersLoading ? (
                  <SelectItem disabled value='loading'>
                    Loading users...
                  </SelectItem>
                ) : availableUsersToAdd.length === 0 ? (
                  <SelectItem disabled value='none'>
                    All users already added
                  </SelectItem>
                ) : (
                  availableUsersToAdd.map((user: User) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className='w-[250px] text-left sm:w-[300px]'>
                        <TruncatedDropdownText text={user.username} />
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <div className='flex justify-end'>
              <Button
                className='bg-primary text-white'
                disabled={!selectedUserToAdd || addProjectUserMutation.isPending}
                onClick={handleAddProjectUser}
              >
                {addProjectUserMutation.isPending && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                Add User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
