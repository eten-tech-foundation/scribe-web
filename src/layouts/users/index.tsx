'use client';
import { Suspense, useEffect, useState } from 'react';

import { MoreVerticalIcon } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import { UserForm } from '@/components/Popups/CreateUser';
import { UsersTableSkeleton } from '@/components/Skeletons/UsersTableSkeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { config } from '@/lib/config';

import { type Column, type User } from './types';

const columns: Column[] = [
  {
    key: 'name',
    label: 'Name',
    accessor: (user: User) => `${user.firstName} ${user.lastName}`,
  },
  {
    key: 'role',
    label: 'Role',
    accessor: (user: User) => user.role,
  },
  {
    key: 'email',
    label: 'Email',
    accessor: (user: User) => user.email,
  },
  {
    key: 'status',
    label: 'Status',
    accessor: (user: User) => (
      <span className='rounded-full bg-[#068bb3] px-3 py-1 text-sm text-white'>
        {user.isActive ? 'Verified' : 'Invited'}
      </span>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    accessor: (user: User) => user.email,
  },
];

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${config.api.url}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    const roleWithUuid = {
      ...values,
      role: uuidv4(),
    };

    const response = await fetch(`${config.api.url}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roleWithUuid),
    });

    if (response.ok) {
      toast.success('User created successfully');
      setOpen(false);
      await fetchUsers();
    } else {
      toast.error('Failed to create user');
      setOpen(false);
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingUser) return;

    const valuesWithUuid = {
      ...values,
      role: editingUser.role,
    };

    try {
      const response = await fetch(`${config.api.url}/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(valuesWithUuid),
      });

      if (response.ok) {
        toast.success('User updated successfully');
        setEditOpen(false);
        setEditingUser(null);
        await fetchUsers();
      } else {
        toast.error(`Failed to update user: ${response.status}`);
      }
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditOpen(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className='min-h-screen bg-[#faf9f4]'>
      <main className='px-8 py-4'>
        <h1 className='mb-6 text-3xl font-bold'>Users</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className='mb-2 cursor-pointer bg-[#068bb3]'>Add User</Button>
          </DialogTrigger>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <UserForm onSubmit={handleSubmit} />
            </DialogContent>
          </Dialog>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
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
              onSubmit={handleEditSubmit}
            />
          </DialogContent>
        </Dialog>

        <div className='overflow-x-auto rounded-xl bg-[#f5f3ee] p-4 shadow'>
          <ErrorBoundary fallback={<div>Error loading users</div>}>
            <Suspense fallback={<UsersTableSkeleton />}>
              <Table>
                <TableHeader>
                  <TableRow className='border-b'>
                    {columns.map(column => (
                      <TableHead key={column.key} className='font-semibold'>
                        {column.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <UsersTableSkeleton />
                  ) : (
                    users.map(user => (
                      <TableRow key={user.id || user.email}>
                        {columns.map(column => (
                          <TableCell key={column.key}>
                            {column.key === 'actions' ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <MoreVerticalIcon className='h-4 w-4 cursor-pointer text-gray-500' />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>
                                    <Button
                                      className='h-6 cursor-pointer'
                                      variant='ghost'
                                      onClick={() => handleEditClick(user)}
                                    >
                                      Edit
                                    </Button>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              column.accessor(user)
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
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
