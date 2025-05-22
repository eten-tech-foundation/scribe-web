import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Local storage key for language preference (same as in useLanguageDetection hook)
const LANGUAGE_STORAGE_KEY = 'app-language-preference';

interface Language {
  code: string;
  name: string;
}

interface LanguageSelectorProps {
  position?: 'absolute' | 'relative';
  className?: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
];

export const LanguageSelector = ({ className = '' }: LanguageSelectorProps) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string): void => {
    // Update i18n language
    i18n.changeLanguage(lng);

    // Save to local storage
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  };

  return (
    <div className={`absolute top-4 right-3 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size='icon' variant='ghost'>
            <Globe className='h-5 w-5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {languages.map(lang => (
            <DropdownMenuItem
              key={lang.code}
              className={i18n.language === lang.code ? 'bg-accent' : ''}
              onClick={() => changeLanguage(lang.code)}
            >
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSelector;
