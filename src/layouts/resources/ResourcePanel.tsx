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
  const [isInitialized, setIsInitialized] = useState(false);

  // Language management hook
  const {
    availableLanguages,
    selectedLanguage,
    loadingLanguages,
    handleLanguageChange,
    currentLanguageDirection,
  } = useResourceLanguages(selectedResource, sourceData.sourceLangCode, sourceData, activeVerseId);

  // Initialize resource state
  useEffect(() => {
    if (initialResource) {
      setSelectedResource(initialResource);
    }
  }, [initialResource]);

  // Initialize language state after available languages are loaded
  useEffect(() => {
    if (loadingLanguages || availableLanguages.length === 0 || isInitialized) {
      return;
    }

    // Check if initialLanguage exists in available languages
    const languageExists = availableLanguages.some(l => l.code === initialLanguage);

    if (initialLanguage && languageExists) {
      // Initial language is available, use it
      handleLanguageChange(initialLanguage);
    } else if (initialLanguage) {
      // Initial language provided but not available, reset to empty (show "Select a language")
      handleLanguageChange('');
    }

    setIsInitialized(true);
  }, [availableLanguages, loadingLanguages, initialLanguage, isInitialized]);
  console.log('selectedLanguage:', selectedLanguage, selectedResource, activeVerseId, sourceData);

  // Custom hooks
  const { localizeRefName, imageItems, loadingImages } = useResourceFetch(
    selectedResource,
    activeVerseId,
    sourceData,
    selectedLanguage || undefined
  );

  // Track previous language to avoid unnecessary callbacks
  const prevLanguageRef = useRef(selectedLanguage);

  useEffect(() => {
    if (prevLanguageRef.current !== selectedLanguage && selectedLanguage !== '') {
      onLanguageChange?.(selectedLanguage);
      prevLanguageRef.current = selectedLanguage;
    }
  }, [selectedLanguage, onLanguageChange]);

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

    // Reset language to empty when resource changes
    handleLanguageChange('');
    setIsInitialized(false);
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
    if (localizeRefName.length > 0) {
      const firstItemId = localizeRefName[0].id.toString();
      setOpenItem(firstItemId);
      handleAccordionChange(firstItemId);
    } else {
      setOpenItem(null);
    }
  }, [localizeRefName]);

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

        <LanguageDropdown
          availableLanguages={availableLanguages}
          loading={loadingLanguages}
          selectedLanguage={selectedLanguage}
          onSelect={handleLanguageSelect}
        />
      </div>

      <div className='flex-1 overflow-y-auto rounded-md border px-4 pt-2'>
        {loadingImages ? (
          <div className='flex h-full items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
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
