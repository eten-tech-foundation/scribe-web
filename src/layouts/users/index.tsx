'use client';
import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { UserForm } from '@/components/Popups/CreateUser';
import { UsersTableSkeleton } from '@/components/Skeletons/UsersTableSkeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { type User } from './types';
import useUserActions from './useUserActions';

export function UsersPage() {
  const {
    columns,
    users,
    isLoading,
    open,
    setOpen,
    editOpen,
    setEditOpen,
    editingUser,
    handleSubmit,
    handleEditSubmit,
    handleEditClick,
    createUserMutation,
    updateUserMutation,
    sortUsers,
  } = useUserActions();

  return (
    <div className='dark:bg-background min-h-screen bg-[#faf9f4]'>
      <main className='px-8 py-4'>
        <h1 className='mb-6 text-3xl font-bold'>Users</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className='mb-2 cursor-pointer bg-[#068bb3] dark:bg-[#068bb3]'>Add User</Button>
          </DialogTrigger>
          <DialogContent onPointerDownOutside={e => e.preventDefault()}>
            <UserForm isLoading={createUserMutation.isPending} onSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent onPointerDownOutside={e => e.preventDefault()}>
            <UserForm
              initialData={
                editingUser
                  ? {
                      email: editingUser.email,
                      username:
                        editingUser.username ||
                        `${editingUser.firstName} ${editingUser.lastName}`.trim() ||
                        '',
                      firstName: editingUser.firstName || '',
                      lastName: editingUser.lastName || '',
                      role: editingUser.role || '',
                    }
                  : undefined
              }
              isEdit={true}
              isLoading={updateUserMutation.isPending}
              onSubmit={handleEditSubmit}
            />
          </DialogContent>
        </Dialog>

        <div className='overflow-x-auto rounded-xl border-1 border-gray-300'>
          <ErrorBoundary fallback={<div>Error loading users</div>}>
            <Suspense fallback={<UsersTableSkeleton />}>
              <Table className='overflow-hidden p-4'>
                <TableHeader>
                  <TableRow className='dark:bg-background border-b bg-[#f5f3ee]'>
                    {columns.map(column => (
                      <TableHead key={column.key} className='p-3 font-semibold'>
                        {column.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className='p-1'>
                  {isLoading ? (
                    <UsersTableSkeleton />
                  ) : users && users.length > 0 ? (
                    users.sort(sortUsers).map((user: User) => (
                      <TableRow key={user.id || user.email}>
                        {columns.map(column => (
                          <TableCell
                            key={column.key}
                            className='cursor-pointer p-4'
                            onClick={() => handleEditClick(user)}
                          >
                            {column.key === 'status' ? (
                              <span
                                className={`rounded-full px-3 py-1 text-sm text-white ${user.isActive ? 'bg-[#068bb3]' : 'bg-gray-400'}`}
                              >
                                {column.accessor(user)}
                              </span>
                            ) : (
                              column.accessor(user)
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        className='py-8 text-center text-gray-500'
                        colSpan={columns.length}
                      >
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
