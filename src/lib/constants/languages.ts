export interface Language {
  code: string;
  name: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
];

export const LANGUAGE_STORAGE_KEY = 'app-language-preference';
