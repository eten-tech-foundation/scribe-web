export interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
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
  bibleId: number;
  bookId: number[];
  organization: number;
  createdBy: number;
  metadata: Record<string, unknown>;
  sourceLanguage: number;
  targetLanguage: number;
}
export interface Chapter {
  id: string | number;
  book: string;
  chapter: number;
  assigned?: string;
  status: number;
  totalVerses?: number;
}

export interface ChapterAssignmentProgress {
  bookNameEng: string;
  chapterNumber: number;
  assignedUser: User | null;
  projectUnitId: number;
  assignmentId: number;
  totalVerses: number;
  completedVerses: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  isSubmitted?: boolean;
  submittedTime?: Date | null;
}

export interface Book {
  bookId: number;
  code: string;
  engDisplayName: string;
}

export interface ProjectItem {
  chapterAssignmentId: number;
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
  submittedTime: string | null;
}

export interface VerseData {
  projectUnitId: number;
  content: string;
  bibleTextId: number;
  assignedUserId: number;
}

export interface Source {
  id: number;
  verseNumber: number;
  text: string;
}

export interface TargetVerse {
  id?: number;
  content: string;
  verseNumber: number;
}

export interface DraftingUIProps {
  projectItem: ProjectItem;
  sourceVerses: Source[];
  targetVerses: TargetVerse[];
  userdetail: User;
  readOnly?: boolean;
}
