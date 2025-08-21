import { useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { BibleBookMultiSelectPopover } from '@/components/BookSelector';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    // Limit to 100 characters
    if (value.length <= 100) {
      updateFormData('title', value);
    }
  };

  const getAvailableSourceBibles = () => {
    return sourceBibleOptions[formData.sourceLanguage] || [];
  };

  const isButtonDisabled = isLoading || !isFormValid();

  return (
    <div className='text-gray-800'>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-[500px]' onInteractOutside={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{t('createProject')}</DialogTitle>
          </DialogHeader>
          <div className='space-y-6 py-6'>
            {/* Project Title */}
            <div className='space-y-2'>
              <Label htmlFor='title'>{t('projectName')} </Label>
              <Input
                id='title'
                maxLength={100}
                // placeholder='Enter project name'
                value={formData.title}
                onChange={handleTitleChange}
              />
              {/* <p className='text-muted-foreground text-sm'>
                {formData.title.length}/100 characters
              </p> */}
            </div>

            {/* Target Language */}
            <div className='space-y-2'>
              <Label>{t('targetLanguage')} </Label>
              <Select
                value={formData.targetLanguage}
                onValueChange={value => updateFormData('targetLanguage', value)}
              >
                <SelectTrigger className='w-full bg-white'>
                  <SelectValue placeholder='Select Target Language' />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source Language */}
            <div className='space-y-2'>
              <Label>{t('sourceLanguage')}</Label>
              <Select
                value={formData.sourceLanguage}
                onValueChange={value => updateFormData('sourceLanguage', value)}
              >
                <SelectTrigger className='w-full bg-white'>
                  <SelectValue placeholder='Select Source Language' />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source Bible */}
            <div className='space-y-2'>
              <Label>{t('sourceBible')} </Label>
              <Select
                disabled={!formData.sourceLanguage}
                value={formData.sourceBible}
                onValueChange={value => updateFormData('sourceBible', value)}
              >
                <SelectTrigger className='w-full bg-white'>
                  <SelectValue
                    placeholder={
                      formData.sourceLanguage
                        ? 'Select Source Bible'
                        : 'Select Source Language First'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableSourceBibles().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Books Selection */}
            <div className='space-y-2'>
              <Label>{t('books')} </Label>
              <BibleBookMultiSelectPopover
                value={formData.books}
                onChange={newBooks => setFormData(prev => ({ ...prev, books: newBooks }))}
              />
            </div>

            {/* Action Buttons */}
            <div className='flex justify-end gap-2 pt-4'>
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
        </DialogContent>
      </Dialog>
    </div>
  );
};
