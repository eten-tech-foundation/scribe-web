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

const knownErrors = ['A user with this email already exists.', 'Username already exists.'];
const apiRequest = async <T>(url: string, options: RequestInit, email: string): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': email,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorMessage = await parseErrorMessage(response);
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const errorData = (await response.json()) as { message?: string };
    if (errorData.message && knownErrors.includes(errorData.message)) {
      return errorData.message;
    }
  } catch {
    const text = await response.text();
    if (text && knownErrors.includes(text)) return text;
  }

  return 'Generic API error';
};

const createUser = async (userData: Omit<User, 'id'>, email: string): Promise<User> => {
  try {
    return await apiRequest<User>(
      `${config.api.url}/users/invite`,
      {
        method: 'POST',
        body: JSON.stringify(userData),
      },
      email
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message && error.message !== 'Generic API error') {
      return Promise.reject(error);
    }
    return Promise.reject(new Error('Error: User was not created.'));
  }
};

const updateUser = async (userData: User, email: string): Promise<User> => {
  try {
    return await apiRequest<User>(
      `${config.api.url}/users/${userData.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(userData),
      },
      email
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message && error.message !== 'Generic API error') {
      return Promise.reject(error);
    }
    return Promise.reject(new Error('Error: User was not saved.'));
  }
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
      void queryClient.invalidateQueries({ queryKey: ['users'] });
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
