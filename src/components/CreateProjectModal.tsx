import { useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { BibleBookMultiSelectPopover } from '@/components/BookSelector';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { Modal } from '@/components/ui/Modal';
import { Logger } from '@/lib/services/logger';

// Language options - you can move this to a constants file
export const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'bn', label: 'Bengali' },
  { value: 'ur', label: 'Urdu' },
  { value: 'pa', label: 'Punjabi' },
  { value: 'ks', label: 'Kashmiri' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'kn', label: 'Kannada' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'mr', label: 'Marathi' },
  { value: 'or', label: 'Odia' },
  { value: 'as', label: 'Assamese' },
  // Add more languages as needed
];

// Source Bible options by language
export const sourceBibleOptions: Record<string, Array<{ value: string; label: string }>> = {
  en: [
    { value: 'ESV', label: 'English Standard Version (ESV)' },
    { value: 'NIV', label: 'New International Version (NIV)' },
    { value: 'NASB', label: 'New American Standard Bible (NASB)' },
    { value: 'KJV', label: 'King James Version (KJV)' },
  ],
  hi: [
    { value: 'HI_GLT', label: 'Gateway Literal Text (Hindi) (HI_GLT)' },
    { value: 'HI_GST', label: 'Gateway Simplified Text (Hindi) (HI_GST)' },
    { value: 'IRV', label: 'Indian Revised Version (IRV)' },
    { value: 'OHV', label: 'Open Hindi Contemporary Version (OHV)' },
  ],
  bn: [
    { value: 'BN_CL', label: 'Bengali Common Language' },
    { value: 'BN_CRV', label: 'Bengali Contemporary Revised Version' },
  ],
  // Add more language-specific Bibles as needed
};

// Bible books - all 66 books
export const bibleBooks = [
  // Old Testament
  { value: 'gen', label: 'Genesis' },
  { value: 'exo', label: 'Exodus' },
  { value: 'lev', label: 'Leviticus' },
  { value: 'num', label: 'Numbers' },
  { value: 'deu', label: 'Deuteronomy' },
  { value: 'jos', label: 'Joshua' },
  { value: 'jdg', label: 'Judges' },
  { value: 'rut', label: 'Ruth' },
  { value: '1sa', label: '1 Samuel' },
  { value: '2sa', label: '2 Samuel' },
  { value: '1ki', label: '1 Kings' },
  { value: '2ki', label: '2 Kings' },
  { value: '1ch', label: '1 Chronicles' },
  { value: '2ch', label: '2 Chronicles' },
  { value: 'ezr', label: 'Ezra' },
  { value: 'neh', label: 'Nehemiah' },
  { value: 'est', label: 'Esther' },
  { value: 'job', label: 'Job' },
  { value: 'psa', label: 'Psalms' },
  { value: 'pro', label: 'Proverbs' },
  { value: 'ecc', label: 'Ecclesiastes' },
  { value: 'sng', label: 'Song of Songs' },
  { value: 'isa', label: 'Isaiah' },
  { value: 'jer', label: 'Jeremiah' },
  { value: 'lam', label: 'Lamentations' },
  { value: 'ezk', label: 'Ezekiel' },
  { value: 'dan', label: 'Daniel' },
  { value: 'hos', label: 'Hosea' },
  { value: 'jol', label: 'Joel' },
  { value: 'amo', label: 'Amos' },
  { value: 'oba', label: 'Obadiah' },
  { value: 'jon', label: 'Jonah' },
  { value: 'mic', label: 'Micah' },
  { value: 'nam', label: 'Nahum' },
  { value: 'hab', label: 'Habakkuk' },
  { value: 'zep', label: 'Zephaniah' },
  { value: 'hag', label: 'Haggai' },
  { value: 'zec', label: 'Zechariah' },
  { value: 'mal', label: 'Malachi' },
  // New Testament
  { value: 'mat', label: 'Matthew' },
  { value: 'mrk', label: 'Mark' },
  { value: 'luk', label: 'Luke' },
  { value: 'jhn', label: 'John' },
  { value: 'act', label: 'Acts' },
  { value: 'rom', label: 'Romans' },
  { value: '1co', label: '1 Corinthians' },
  { value: '2co', label: '2 Corinthians' },
  { value: 'gal', label: 'Galatians' },
  { value: 'eph', label: 'Ephesians' },
  { value: 'php', label: 'Philippians' },
  { value: 'col', label: 'Colossians' },
  { value: '1th', label: '1 Thessalonians' },
  { value: '2th', label: '2 Thessalonians' },
  { value: '1ti', label: '1 Timothy' },
  { value: '2ti', label: '2 Timothy' },
  { value: 'tit', label: 'Titus' },
  { value: 'phm', label: 'Philemon' },
  { value: 'heb', label: 'Hebrews' },
  { value: 'jas', label: 'James' },
  { value: '1pe', label: '1 Peter' },
  { value: '2pe', label: '2 Peter' },
  { value: '1jn', label: '1 John' },
  { value: '2jn', label: '2 John' },
  { value: '3jn', label: '3 John' },
  { value: 'jud', label: 'Jude' },
  { value: 'rev', label: 'Revelation' },
];

export interface CreateProjectData {
  title: string;
  targetLanguage: string;
  sourceLanguage: string;
  sourceBible: string;
  books: string[];
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: CreateProjectData) => Promise<void>;
  isLoading?: boolean;
}

interface FormData {
  title: string;
  targetLanguage: string;
  sourceLanguage: string;
  sourceBible: string;
  books: string[];
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    targetLanguage: '',
    sourceLanguage: '',
    sourceBible: '',
    books: [],
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        targetLanguage: '',
        sourceLanguage: '',
        sourceBible: '',
        books: [],
      });
    }
  }, [isOpen]);

  // Reset source bible when source language changes
  useEffect(() => {
    if (formData.sourceLanguage) {
      setFormData(prev => ({
        ...prev,
        sourceBible: '',
      }));
    }
  }, [formData.sourceLanguage]);

  const isFormValid = (): boolean => {
    return Boolean(
      formData.title.trim() &&
        formData.title.trim().length <= 100 &&
        formData.targetLanguage &&
        formData.sourceLanguage &&
        formData.sourceBible &&
        formData.books.length > 0
    );
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      Logger.logException(error instanceof Error ? error : new Error(String(error)), {
        source: 'create project submit',
      });
    }
  };

  const updateFormData = (field: keyof FormData, value: string | string[]): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTitleChange = (value: string): void => {
    // Limit to 100 characters
    if (value.length <= 100) {
      updateFormData('title', value);
    }
  };

  const handleBooksChange = (value: string): void => {
    // Handle multi-select for books
    const currentBooks = formData.books;
    const newBooks = currentBooks.includes(value)
      ? currentBooks.filter(book => book !== value)
      : [...currentBooks, value];
    updateFormData('books', newBooks);
  };

  const getAvailableSourceBibles = () => {
    return sourceBibleOptions[formData.sourceLanguage] || [];
  };

  //   const getSelectedBooksDisplay = () => {
  //     if (formData.books.length === 0) return 'Select Books';
  //     if (formData.books.length === 1) {
  //       const book = bibleBooks.find(b => b.value === formData.books[0]);
  //       return book?.label ?? formData.books[0];
  //     }
  //     return `${formData.books.length} books selected`;
  //   };

  const isButtonDisabled = isLoading || !isFormValid();

  return (
    <div className='text-gray-800'>
      <Modal isOpen={isOpen} title={t('createProject')} onClose={onClose}>
        <div className='py-10'>
          <FormInput
            required
            // helperText={`${formData.title.length}/100 characters`}
            label={t('projectName')}
            value={formData.title}
            onChange={handleTitleChange}
          />

          <FormSelect
            // required
            label={t('targetLanguage')}
            options={languageOptions}
            placeholder='Select Target Language'
            value={formData.targetLanguage}
            onChange={value => updateFormData('targetLanguage', value)}
          />

          <FormSelect
            // required
            label={t('sourceLanguage')}
            options={languageOptions}
            placeholder='Select Source Language'
            value={formData.sourceLanguage}
            onChange={value => updateFormData('sourceLanguage', value)}
          />

          <FormSelect
            // required
            // disabled={!formData.sourceLanguage}
            label={t('sourceBible')}
            options={getAvailableSourceBibles()}
            placeholder={
              formData.sourceLanguage ? 'Select Source Bible' : 'Select Source Language First'
            }
            value={formData.sourceBible}
            onChange={value => updateFormData('sourceBible', value)}
          />

          {/* Multi-select Books - Custom implementation */}
          <div className='mb-4'>
            {t('books')}
            <BibleBookMultiSelectPopover
              value={formData.books}
              onChange={newBooks => setFormData(prev => ({ ...prev, books: newBooks }))}
              // optional:
              // placeholder="Select Books"
              // maxVisibleNames={3}
            />
          </div>

          <div className='my-7 flex justify-end gap-2'>
            <Button
              className='bg-primary hover:bg-primary/90 text-white hover:cursor-pointer'
              disabled={isButtonDisabled}
              type='button'
              onClick={handleSubmit}
            >
              {isLoading ? (
                <div className='flex items-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  <span>Creating...</span>
                </div>
              ) : (
                t('createProject')
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
