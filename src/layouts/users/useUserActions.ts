import { useCallback, useEffect, useMemo, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import { config } from '@/lib/config';
import logger from '@/lib/error-logger';
import { rolesUtils } from '@/utils/rolesUtils';

import { type Column, type User, type UserFormValues } from './types';

const useUserActions = () => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { getAccessToken } = useAuth();
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    async function fetchToken() {
      try {
        const t = await getAccessToken();
        setToken(t);
      } catch (error) {
        logger.error(error as Error, 'useUserActions', 'getAccessToken');
      }
    }
    fetchToken();
  }, [getAccessToken]);

  const columns: Column[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        accessor: (user: User) => `${user.firstName} ${user.lastName}`,
      },
      {
        key: 'role',
        label: 'Role',
        accessor: (user: User) => rolesUtils.getRoleNameById(user.role),
      },
      {
        key: 'email',
        label: 'Email',
        accessor: (user: User) => user.email,
      },
      {
        key: 'status',
        label: 'Status',
        accessor: (user: User) => (user.isActive ? 'Verified' : 'Invited'),
      },
    ],
    []
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!editOpen) {
      setEditingUser(null);
    }
  }, [editOpen]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${config.api.url}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error(error as Error, 'useUserActions', 'fetchUsers');
      throw error;
    }
  };

  const { data: users, isLoading } = useQuery({
    queryKey: ['users-list'],
    queryFn: fetchUsers,
  });

  const createUserMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const roleWithUuid = {
        ...values,
        role: rolesUtils.getRoleIdByName(values.role),
      };

      const response = await fetch(`${config.api.url}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roleWithUuid),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('User created successfully');
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
    },
    onError: error => {
      toast.error('Failed to create user');
      logger.error(error as Error, 'useUserActions', 'createUserMutation');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      if (!editingUser) throw new Error('No user selected for editing');

      const valuesWithRole = {
        ...values,
        role: rolesUtils.getRoleIdByName(values.role),
      };

      const response = await fetch(`${config.api.url}/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(valuesWithRole),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('User updated successfully');
      setEditOpen(false);
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
    },
    onError: error => {
      toast.error('Failed to update user');
      logger.error(error as Error, 'useUserActions', 'updateUserMutation');
    },
  });

  const handleSubmit = async (values: UserFormValues) => {
    try {
      await createUserMutation.mutateAsync(values);
    } catch (error) {
      logger.error(error as Error, 'useUserActions', 'handleSubmit');
    }
  };

  const handleEditSubmit = async (values: UserFormValues) => {
    try {
      await updateUserMutation.mutateAsync(values);
    } catch (error) {
      logger.error(error as Error, 'useUserActions', 'handleEditSubmit');
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditOpen(true);
  };

  const sortUsers = useCallback((a: User, b: User) => {
    const aFirstName = (a.firstName || '').toLowerCase();
    const aLastName = (a.lastName || '').toLowerCase();
    const bFirstName = (b.firstName || '').toLowerCase();
    const bLastName = (b.lastName || '').toLowerCase();

    const firstNameComparison = aFirstName.localeCompare(bFirstName);
    if (firstNameComparison !== 0) return firstNameComparison;
    return aLastName.localeCompare(bLastName);
  }, []);

  return {
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
  };
};

export default useUserActions;
