export interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: number;
  status?: string;
  organization: number;
  createdBy?: number;
  isActive?: boolean;
}

export interface Project {
  id: number;
  name: string;
  sourceName: string;
  organization: number;
  status: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
  sourceLanguageName: string;
  targetLanguageName: string;
}

export interface CreateProject {
  id: number;
  name: string;
  bible_id: number;
  book_id: number[];
  organization: number;
  createdBy: number;
  metadata: Record<string, unknown>;
  sourceLanguage: number;
  targetLanguage: number;
}

export interface ProjectItem {
  projectName: string;
  projectUnitId: number;
  bibleId: number;
  bibleName: string;
  targetLanguage: string;
  bookId: number;
  book: string;
  chapterNumber: number;
  totalVerses: number;
  completedVerses: number;
  isSubmitted: boolean;
  submittedTime: string | null;
}
