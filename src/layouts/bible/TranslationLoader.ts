import { type LoaderFnContext } from '@tanstack/react-router';

import { fetchTargetText } from '@/hooks/useBibleTarget';
import { fetchBibleText } from '@/hooks/useBibleText';
import { type ProjectItem } from '@/lib/types';
import { useAppStore } from '@/store/store';

import { type Source, type TargetVerse } from './DraftingPage';

interface SourceVerseData {
  id: number;
  verseNumber: number;
  text: string;
}

interface TargetVerseData {
  id: number;
  verseNumber: number;
  content: string;
}

const toSourceVerse = (verse: SourceVerseData): Source => ({
  id: verse.id,
  verseNumber: verse.verseNumber,
  text: verse.text,
});

const toTargetVerse = (verse: TargetVerseData): TargetVerse => ({
  id: verse.id,
  verseNumber: verse.verseNumber,
  content: verse.content,
});

export const translationLoader = async ({ location }: LoaderFnContext) => {
  const { projectItem } = location.state as { projectItem: ProjectItem };
  const { userdetail } = useAppStore.getState();

  if (!userdetail) {
    throw new Error('User details are missing.');
  }

  const [sourceVerseData, targetVerseData] = await Promise.all([
    fetchBibleText(projectItem.bibleId, projectItem.bookId, projectItem.chapterNumber),
    fetchTargetText(
      projectItem.projectUnitId,
      projectItem.bookId,
      projectItem.chapterNumber,
      userdetail.email
    ),
  ]);

  const sourceVerses: Source[] = (sourceVerseData as unknown as SourceVerseData[]).map(
    toSourceVerse
  );
  const targetVerses: TargetVerse[] = (targetVerseData as unknown as TargetVerseData[]).map(
    toTargetVerse
  );

  return {
    projectItem,
    sourceVerses,
    targetVerses,
  };
};
