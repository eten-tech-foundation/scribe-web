import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { LANGUAGE_STORAGE_KEY, languages } from '@/lib/constants/languages';

// Define navigator interface to fix TypeScript issues
interface NavigatorWithUserLanguage extends Navigator {
  userLanguage?: string;
}

export const useLanguageDetection = () => {
  const { i18n } = useTranslation();

  // Function to get browser's preferred language
  const getBrowserLanguage = (): string => {
    const supportedLanguages = languages.map(lang => lang.code);

    // Get browser languages array - navigator.languages is always defined in modern browsers
    const nav = navigator as NavigatorWithUserLanguage;
    const browserLangs =
      navigator.languages.length > 0
        ? navigator.languages
        : [nav.userLanguage ?? navigator.language];

    // Try to find a match in our supported languages
    const primaryLang = browserLangs[0].split('-')[0].toLowerCase();

    if (supportedLanguages.includes(primaryLang)) {
      return primaryLang;
    }

    return 'en'; // Default to English if no match found
  };

  // Initialize language state
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    // First check if we have a saved preference in local storage
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (savedLanguage && languages.some(lang => lang.code === savedLanguage)) {
      return savedLanguage;
    }

    // Fall back to browser language detection if no saved preference
    return getBrowserLanguage();
  });

  useEffect(() => {
    // Apply the language with proper promise handling
    const applyLanguage = async () => {
      try {
        await i18n.changeLanguage(currentLanguage);
        // Save to local storage whenever language changes
        localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
      } catch (error) {
        console.error('Failed to change language:', error);
      }
    };

    void applyLanguage();

    // Listen for changes from i18n that might happen from elsewhere
    const handleLanguageChanged = (lng: string) => {
      if (lng !== currentLanguage) {
        setCurrentLanguage(lng);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
      }
    };

    // Add language changed listener
    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [currentLanguage, i18n]);

  return currentLanguage;
};

export default useLanguageDetection;
