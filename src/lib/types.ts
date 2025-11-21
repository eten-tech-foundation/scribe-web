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
  bookCode: string;
  sourceLangCode: string;
}

export interface VerseData {
  projectUnitId: number;
  content: string;
  bibleTextId: number;
  assignedUserId: number;
}

export interface AudioStep {
  stepNumber: number;
  url: string;
}

export interface AudioData {
  url?: string;
  steps?: AudioStep[];
}

export interface AudioContent {
  mp3?: AudioData;
  webm?: AudioData;
}

export interface TipTapMark {
  type: string;
  attrs?: {
    resourceId?: number;
    level?: number;
    indent?: number;
    src?: string;
    alt?: string;
    start?: number;
    [key: string]: unknown;
  };
}

export interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  marks?: TipTapMark[];
  attrs?: {
    level?: number;
    indent?: number;
    src?: string;
    alt?: string;
    start?: number;
    resourceId?: number;
    [key: string]: unknown;
  };
}

export interface ContentItem {
  tiptap?: TipTapNode | AudioContent;
  stepNumber?: number;
  url?: string;
}

export type GuideContentData = ContentItem[] | AudioContent;

export interface GroupingData {
  name?: string;
  collectionCode?: string;
}

export interface GuideContent {
  id: number;
  name: string;
  localizedName: string;
  content: GuideContentData;
  grouping: GroupingData;
}

export interface ItemWithUrl {
  id: number;
  name: string;
  localizedName: string;
  mediaType: string;
  url: string;
  thumbnailUrl?: string;
  isVideo?: boolean;
  grouping: GroupingData;
}

export interface ResourceName {
  id: string;
  name: string;
}

export interface ResourceItem {
  id: number;
  localizedName: string;
  mediaType: string;
  grouping: GroupingData;
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
