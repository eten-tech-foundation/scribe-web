import { useQuery } from '@tanstack/react-query';

import { config } from '@/lib/config';

interface Book {
  book_id: number;
  code: string;
  eng_display_name: string;
}

const fetchProjectUnitBooks = async (projectUnitId: string, email: string): Promise<Book[]> => {
  const res = await fetch(`${config.api.url}/projects/${projectUnitId}/books`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': email,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch project unit books');

  const data = (await res.json()) as Book[];
  return data;
};

export const useProjectUnitBooks = (projectUnitId: string, email: string) => {
  return useQuery<Book[]>({
    queryKey: ['project-unit-books', projectUnitId],
    queryFn: () => fetchProjectUnitBooks(projectUnitId, email),
    enabled: !!projectUnitId,
  });
};
