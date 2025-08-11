import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { config } from '@/lib/config';
import { type User } from '@/lib/types';

const fetchUsers = async (email: string): Promise<User[]> => {
  const res = await fetch(`${config.api.url}/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': email,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch users');

  const data = (await res.json()) as User[];
  return data;
};

const createUser = async (userData: Omit<User, 'id'>, email: string): Promise<User> => {
  const res = await fetch(`${config.api.url}/users/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': email,
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error('Failed to create user');
  const data = (await res.json()) as User;
  return data;
};

const updateUser = async (userData: User, email: string): Promise<User> => {
  const res = await fetch(`${config.api.url}/users/${userData.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': email,
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error('Failed to update user');
  const data = (await res.json()) as User;
  return data;
};

const getUserDetails = async (email: string): Promise<User> => {
  const res = await fetch(`${config.api.url}/users/email/${email}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch user details');
  const data = (await res.json()) as User;
  return data;
};

export const useUsers = (email: string) => {
  return useQuery<User[]>({
    queryKey: ['users', email],
    queryFn: () => fetchUsers(email),
    enabled: !!email,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userData, email }: { userData: Omit<User, 'id'>; email: string }) =>
      createUser(userData, email),
    onSuccess: () => {
      // Invalidate and refetch users list
      void void void void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: error => {
      console.error('Error creating user:', error);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userData, email }: { userData: User; email: string }) =>
      updateUser(userData, email),
    onSuccess: () => {
      // Invalidate and refetch users list
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: error => {
      console.error('Error updating user:', error);
    },
  });
};

export const useGetUserDetailsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: getUserDetails,
    onSuccess: (data, email) => {
      // Cache the user details and invalidate related queries
      queryClient.setQueryData(['userDetails', email], data);
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: error => {
      console.error('Error fetching user details:', error);
    },
  });
};
