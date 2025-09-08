import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { config } from '@/lib/config';
import { type CreateProject, type Project, type ProjectItem } from '@/lib/types';

const fetchProjects = async (email: string): Promise<Project[]> => {
  const res = await fetch(`${config.api.url}/projects`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': email,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch projects');

  const data = (await res.json()) as Project[];
  return data;
};

const createProject = async (
  projectData: Omit<CreateProject, 'id' | 'createdAt' | 'updatedAt'>,
  email: string
): Promise<Project> => {
  const res = await fetch(`${config.api.url}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': email,
    },
    body: JSON.stringify(projectData),
  });
  if (!res.ok) throw new Error('Failed to create project');
  const data = (await res.json()) as Project;
  return data;
};

export const useProjects = (email: string) => {
  return useQuery<Project[]>({
    queryKey: ['projects', email],
    queryFn: () => fetchProjects(email),
    enabled: !!email,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectData,
      email,
    }: {
      projectData: Omit<CreateProject, 'id' | 'createdAt' | 'updatedAt'>;
      email: string;
    }) => createProject(projectData, email),
    onSuccess: () => {
      // Invalidate and refetch projects list
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: error => {
      console.error('Error creating project:', error);
    },
  });
};

const fetchChapterAssignments = async (email: string): Promise<ProjectItem[]> => {
  const response = await fetch(`${config.api.url}/chapter-assignments/user/${email}`);
  if (!response.ok) {
    throw new Error('Failed to fetch chapter assignments');
  }
  return (await response.json()) as ProjectItem[];
};

export const useChapterAssignments = (email: string) => {
  return useQuery<ProjectItem[]>({
    queryKey: ['chapter-assignments', email],
    queryFn: () => fetchChapterAssignments(email),
    enabled: !!email,
  });
};
