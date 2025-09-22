import { useMutation, useQueryClient } from '@tanstack/react-query';

import { config } from '@/lib/config';
import { type ProjectItem, type VerseData } from '@/lib/types';

export const fetchTargetText = async (
  projectUnitId: number,
  bookId: number,
  chapterNumber: number,
  email: string
): Promise<ProjectItem[]> => {
  const res = await fetch(
    `${config.api.url}/projects/translated-verses/${projectUnitId}/${bookId}/${chapterNumber}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': email,
      },
    }
  );

  if (!res.ok) throw new Error('Failed to fetch Target Text');

  const data = (await res.json()) as ProjectItem[];
  return data;
};

const addTranslatedVerse = async (verseData: VerseData, email: string): Promise<ProjectItem> => {
  const res = await fetch(`${config.api.url}/translated-verses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': email,
    },
    body: JSON.stringify(verseData),
  });
  if (!res.ok) throw new Error('Failed to add verse text');
  const data = (await res.json()) as ProjectItem;
  return data;
};

export const useAddTranslatedVerse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ verseData, email }: { verseData: VerseData; email: string }) =>
      addTranslatedVerse(verseData, email),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['verse-text'] });
    },
    onError: error => {
      console.error('Error creating project:', error);
    },
  });
};
