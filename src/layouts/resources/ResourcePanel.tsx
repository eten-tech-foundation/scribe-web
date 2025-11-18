import { useEffect, useRef, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { type ItemWithUrl, type ProjectItem, type ResourceName } from '@/lib/types';

import {
  useGuideContent,
  useResourceDialog,
  useResourceFetch,
  useResourceLanguages,
} from './hooks';
import { LanguageDropdown } from './LanguageDropdown';
import { ResourceDropdown } from './ResourceComponents';
import { ImageDialog, ImageGrid, ResourceDialog } from './ResourceDialog';
import { TextResourceAccordion } from './TextResourceAccordion';

interface ResourcePanelProps {
  activeVerseId: number;
  sourceData: ProjectItem;
  resourceNames: ResourceName[];
  onResourceChange?: (resource: ResourceName) => void;
  onLanguageChange?: (language: string) => void;
  initialResource?: ResourceName;
  initialLanguage?: string;
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({
  activeVerseId,
  sourceData,
  resourceNames,
  onResourceChange,
  onLanguageChange,
  initialResource,
  initialLanguage,
}) => {
  const [selectedResource, setSelectedResource] = useState(initialResource ?? resourceNames[0]);
  const [selectedImage, setSelectedImage] = useState<ItemWithUrl | null>(null);
  const [openItem, setOpenItem] = useState<string | null>(null);

  // Track if language has been initialized from parent
  const isLanguageInitializedRef = useRef(false);
  const hasAutoSelectedRef = useRef(false);

  // Language management hook (does NOT depend on activeVerseId)
  const {
    availableLanguages,
    selectedLanguage,
    loadingLanguages,
    handleLanguageChange,
    currentLanguageDirection,
  } = useResourceLanguages(selectedResource, sourceData.sourceLangCode, sourceData);
  console.log(availableLanguages, 'availableLanguages in ResourcePanel');

  // Update resource when initialResource changes
  useEffect(() => {
    if (initialResource) {
      setSelectedResource(initialResource);
    }
  }, [initialResource]);

  // Initialize language from saved state OR auto-select source language
  useEffect(() => {
    // Only initialize once
    if (isLanguageInitializedRef.current) return;

    // Wait for languages to load
    if (loadingLanguages || availableLanguages.length === 0) return;

    // Check if we have an initialLanguage from saved state
    if (initialLanguage) {
      const languageExists = availableLanguages.some(l => l.code === initialLanguage);

      if (languageExists) {
        // Saved language exists, use it
        handleLanguageChange(initialLanguage);
        isLanguageInitializedRef.current = true;
        return;
      }
    }

    // No saved language or saved language doesn't exist
    // Auto-select source language if available
    const sourceLanguageExists = availableLanguages.some(l => l.code === sourceData.sourceLangCode);

    if (sourceLanguageExists && !hasAutoSelectedRef.current) {
      handleLanguageChange(sourceData.sourceLangCode);
      hasAutoSelectedRef.current = true;
      isLanguageInitializedRef.current = true;
    } else {
      // No source language available, leave empty for user selection
      handleLanguageChange('');
      isLanguageInitializedRef.current = true;
    }
  }, [
    availableLanguages,
    loadingLanguages,
    initialLanguage,
    sourceData.sourceLangCode,
    handleLanguageChange,
  ]);

  // Reset initialization flag when resource changes
  useEffect(() => {
    isLanguageInitializedRef.current = false;
    hasAutoSelectedRef.current = false;
  }, [selectedResource.id]);

  // Notify parent of language changes (only after initialization)
  const prevLanguageRef = useRef(selectedLanguage);
  useEffect(() => {
    if (
      isLanguageInitializedRef.current &&
      prevLanguageRef.current !== selectedLanguage &&
      selectedLanguage !== ''
    ) {
      onLanguageChange?.(selectedLanguage);
      prevLanguageRef.current = selectedLanguage;
    }
  }, [selectedLanguage, onLanguageChange]);

  // Determine if we should fetch resources
  const shouldFetchResources = isLanguageInitializedRef.current && selectedLanguage !== '';

  // Fetch resources (ONLY this hook depends on activeVerseId for content)
  const { localizeRefName, imageItems, loadingImages } = useResourceFetch(
    selectedResource,
    activeVerseId,
    sourceData,
    shouldFetchResources ? selectedLanguage : undefined
  );

  const {
    guideContents,
    loadingGuides,
    relatedAudioIds,
    setRelatedAudioIds,
    fetchGuideContent,
    fetchRelatedAudio,
  } = useGuideContent();

  const { resourceDialog, loadingResourceDialog, handleResourceClick, resourceError, closeDialog } =
    useResourceDialog();

  // Handle resource selection
  const handleResourceSelect = (resource: ResourceName) => {
    setSelectedResource(resource);
    onResourceChange?.(resource);
    // Reset language when resource changes
    handleLanguageChange('');
  };

  // Handle language selection
  const handleLanguageSelect = (languageCode: string) => {
    handleLanguageChange(languageCode);
  };

  // Handle accordion value change
  const handleAccordionChange = async (value: string | undefined) => {
    setOpenItem(value ?? null);

    if (value) {
      const itemId = parseInt(value);
      if (!guideContents[itemId]) {
        await fetchGuideContent(itemId);
      }

      // Fetch related audio if not already fetched
      const item = localizeRefName.find(sv => sv.id === itemId);
      if (item && relatedAudioIds[itemId] === undefined) {
        const audioId = await fetchRelatedAudio(
          item.localizedName,
          item.grouping?.collectionCode ?? '',
          localizeRefName
        );
        if (audioId !== undefined) {
          setRelatedAudioIds(prev => ({ ...prev, [itemId]: audioId }));
        }
      }
    }
  };

  // Auto-expand first accordion item when resources load
  useEffect(() => {
    if (localizeRefName.length > 0 && shouldFetchResources) {
      const firstItemId = localizeRefName[0].id.toString();
      setOpenItem(firstItemId);
      void handleAccordionChange(firstItemId);
    } else {
      setOpenItem(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localizeRefName, shouldFetchResources]);

  // Show loading state while initializing
  const isInitializing = !isLanguageInitializedRef.current && loadingLanguages;

  // Determine if language dropdown should be enabled
  // Enable for both Translation Notes and Images
  const isLanguageDropdownEnabled =
    selectedResource.id === 'UWTranslationNotes' || selectedResource.name === 'Images';
  console.log('isLanguageDropdownEnabled', isLanguageDropdownEnabled);

  return (
    <aside className='bg-background flex h-full flex-col'>
      <div className='bg-background top-0 py-4'>
        <div className='flex items-center gap-2'>
          <h3 className='text-foreground text-xl font-semibold'>Resources</h3>
        </div>
        <ResourceDropdown
          resourceNames={resourceNames}
          selectedResource={selectedResource}
          onSelect={handleResourceSelect}
        />

        {isLanguageDropdownEnabled && (
          <LanguageDropdown
            availableLanguages={availableLanguages}
            loading={loadingLanguages}
            selectedLanguage={selectedLanguage}
            onSelect={handleLanguageSelect}
          />
        )}
      </div>

      <div className='flex-1 overflow-y-auto rounded-md border px-4 pt-2'>
        {isInitializing || loadingImages ? (
          <div className='flex h-full items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
          </div>
        ) : !shouldFetchResources && isLanguageDropdownEnabled ? (
          <div className='flex h-full items-center justify-center'>
            <p className='text-sm text-gray-500'>Select a language to view resources</p>
          </div>
        ) : imageItems.length > 0 ? (
          <ImageGrid
            activeVerseId={activeVerseId}
            items={imageItems}
            sourceData={sourceData}
            onImageClick={setSelectedImage}
          />
        ) : localizeRefName.length > 0 ? (
          <TextResourceAccordion
            direction={currentLanguageDirection}
            guideContents={guideContents}
            loadingGuides={loadingGuides}
            openItem={openItem}
            relatedAudioIds={relatedAudioIds}
            resources={localizeRefName}
            onAccordionChange={handleAccordionChange}
            onResourceClick={handleResourceClick}
          />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <p className='text-sm text-gray-500'>No resources available</p>
          </div>
        )}
      </div>

      <ImageDialog image={selectedImage} onClose={() => setSelectedImage(null)} />

      <ResourceDialog
        direction={currentLanguageDirection}
        error={resourceError}
        loading={loadingResourceDialog}
        resource={resourceDialog}
        onClose={closeDialog}
        onResourceClick={handleResourceClick}
      />
    </aside>
  );
};

export default ResourcePanel;
