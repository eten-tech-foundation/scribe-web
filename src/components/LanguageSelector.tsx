import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LANGUAGE_STORAGE_KEY, languages } from '@/lib/constants/languages';

interface LanguageSelectorProps {
  position?: 'absolute' | 'relative';
  className?: string;
}

export const LanguageSelector = ({ className = '' }: LanguageSelectorProps) => {
  const { i18n } = useTranslation();

  const changeLanguage = async (lng: string): Promise<void> => {
    try {
      // Update i18n language with proper promise handling
      await i18n.changeLanguage(lng);

      // Save to local storage
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
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
              onClick={() => void changeLanguage(lang.code)}
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
