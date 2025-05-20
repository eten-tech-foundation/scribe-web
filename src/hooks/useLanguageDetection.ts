import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { languages } from '../components/LanguageSelector';

// Local storage key for language preference
const LANGUAGE_STORAGE_KEY = 'app-language-preference';

export const useLanguageDetection = () => {
  const { i18n } = useTranslation();

  // Function to get browser's preferred language
  const getBrowserLanguage = (): string => {
    const supportedLanguages = languages.map(lang => lang.code);

    // Get browser languages array
    const browserLangs = navigator.languages || [
      navigator.language || (navigator as any).userLanguage || 'en',
    ]; // Fallback to English

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
    // Apply the language
    i18n.changeLanguage(currentLanguage);

    // Save to local storage whenever language changes
    localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);

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
