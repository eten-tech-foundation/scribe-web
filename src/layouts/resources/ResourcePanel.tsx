import { useState } from 'react';

import { Loader2 } from 'lucide-react';

import { type ItemWithUrl, type ProjectItem, type ResourceName } from '@/lib/types';

import { useGuideContent, useResourceDialog, useResourceFetch } from './hooks';
import { ImageDialog, ImageGrid, ResourceDropdown } from './ResourceComponents';
import { ResourceDialog } from './ResourceDialog';
import { TextResourceAccordion } from './TextResourceAccordion';

interface ResourcePanelProps {
  activeVerseId: number;
  sourceData: ProjectItem;
  resourceNames: ResourceName[];
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({
  activeVerseId,
  sourceData,
  resourceNames,
}) => {
  const [selectedResource, setSelectedResource] = useState(resourceNames[0]);
  const [selectedImage, setSelectedImage] = useState<ItemWithUrl | null>(null);
  const [openItem, setOpenItem] = useState<string | null>(null);

  // Custom hooks
  const { localizeRefName, imageItems, loadingImages } = useResourceFetch(
    selectedResource,
    activeVerseId,
    sourceData
  );

  const {
    guideContents,
    loadingGuides,
    relatedAudioIds,
    setRelatedAudioIds,
    fetchGuideContent,
    fetchRelatedAudio,
  } = useGuideContent();

  const { resourceDialog, loadingResourceDialog, handleResourceClick, closeDialog } =
    useResourceDialog();

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

  return (
    <aside className='bg-background flex h-full flex-col'>
      <div className='bg-background top-0 py-4'>
        <div className='flex items-center gap-2'>
          <h3 className='text-foreground text-xl font-semibold'>Resources</h3>
        </div>
        <ResourceDropdown
          resourceNames={resourceNames}
          selectedResource={selectedResource}
          onSelect={setSelectedResource}
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
            <p className='text-sm text-gray-500'>No resources found</p>
          </div>
        )}
      </div>

      <ImageDialog image={selectedImage} onClose={() => setSelectedImage(null)} />

      <ResourceDialog
        loading={loadingResourceDialog}
        resource={resourceDialog}
        onClose={closeDialog}
        onResourceClick={handleResourceClick}
      />
    </aside>
  );
};

export default ResourcePanel;
