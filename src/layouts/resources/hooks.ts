import { useEffect, useState } from 'react';

import {
  type GuideContent,
  type ItemWithUrl,
  type ProjectItem,
  type ResourceItem,
  type ResourceName,
} from '@/lib/types';
import { API_BASE_URL } from '@/lib/utils';

interface FetchResponse {
  items: unknown[];
}

interface ResourceDetailsResponse {
  content?: {
    url?: string;
  };
}

// Hook for fetching resources
export const useResourceFetch = (
  selectedResource: ResourceName,
  activeVerseId: number,
  sourceData: ProjectItem
) => {
  const [localizeRefName, setLocalizeRefName] = useState<ResourceItem[]>([]);
  const [imageItems, setImageItems] = useState<ItemWithUrl[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      const isImageResource = selectedResource.name === 'Images';

      if (isImageResource) {
        setLoadingImages(true);
        try {
          const response = await fetch(
            `${API_BASE_URL}/resources/search?BookCode=mrk&StartChapter=${sourceData.chapterNumber}&EndChapter=${sourceData.chapterNumber}&LanguageCode=eng&StartVerse=${activeVerseId}&EndVerse=${activeVerseId}&ResourceType=${selectedResource.id}&Limit=100`,
            // `${API_BASE_URL}/resources/search?BookCode=${sourceData.bookCode}&StartChapter=${sourceData.chapterNumber}&EndChapter=${sourceData.chapterNumber}&LanguageCode=${sourceData.sourceLangCode}&StartVerse=${activeVerseId}&EndVerse=${activeVerseId}&ResourceType=${selectedResource.id}&Limit=100`,
            { method: 'GET', mode: 'cors' }
          );

          if (!response.ok) {
            console.error('Failed to fetch resources');
            return;
          }

          const data = (await response.json()) as FetchResponse;
          const itemsWithUrls: ItemWithUrl[] = await Promise.all(
            data.items.map(async (item: unknown) => {
              const resourceItem = item as ItemWithUrl;
              try {
                const res = await fetch(`${API_BASE_URL}/resources/${resourceItem.id}`, {
                  method: 'GET',
                  mode: 'cors',
                });
                if (!res.ok) throw new Error('Failed to fetch content URL');
                const details = (await res.json()) as ResourceDetailsResponse;
                return {
                  ...resourceItem,
                  url: details.content?.url ?? '',
                  thumbnailUrl: details.content?.url,
                };
              } catch (e) {
                console.error(`Error fetching item ${resourceItem.id}`, e);
                return { ...resourceItem, url: '', thumbnailUrl: '' };
              }
            })
          );

          setImageItems(itemsWithUrls.filter(item => item.url));
          setLocalizeRefName([]);
        } catch (error) {
          console.error('Error fetching media resources:', error);
        } finally {
          setLoadingImages(false);
        }
      } else {
        const response = await fetch(
          `${API_BASE_URL}/resources/search?BookCode=${sourceData.bookCode}&StartChapter=${sourceData.chapterNumber}&EndChapter=${sourceData.chapterNumber}&LanguageCode=eng&StartVerse=${activeVerseId}&EndVerse=${activeVerseId}&ResourceCollectionCode=${selectedResource.id}&Limit=100`,
          // `${API_BASE_URL}/resources/search?BookCode=${sourceData.bookCode}&StartChapter=${sourceData.chapterNumber}&EndChapter=${sourceData.chapterNumber}&LanguageCode=${sourceData.sourceLangCode}&StartVerse=${activeVerseId}&EndVerse=${activeVerseId}&ResourceCollectionCode=${selectedResource.id}&Limit=100`,
          { method: 'GET', mode: 'cors' }
        );
        if (!response.ok) {
          console.error('Failed to fetch resources');
          return;
        }
        const data = (await response.json()) as FetchResponse;
        setLocalizeRefName(data.items as ResourceItem[]);
        setImageItems([]);
      }
    };
    void fetchResources();
  }, [selectedResource, activeVerseId, sourceData]);

  return { localizeRefName, imageItems, loadingImages };
};

// Hook for managing guide content
export const useGuideContent = () => {
  const [guideContents, setGuideContents] = useState<Record<number, GuideContent>>({});
  const [loadingGuides, setLoadingGuides] = useState<Record<number, boolean>>({});
  const [relatedAudioIds, setRelatedAudioIds] = useState<Record<number, number | null>>({});

  const fetchGuideContent = async (id: number): Promise<GuideContent | undefined> => {
    if (guideContents[id]) return guideContents[id];

    setLoadingGuides(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/resources/${id}`, {
        method: 'GET',
        mode: 'cors',
      });
      if (!res.ok) throw new Error('Failed to fetch guide content');
      const data = (await res.json()) as GuideContent;
      setGuideContents(prev => ({ ...prev, [id]: data }));
      return data;
    } catch (e) {
      console.error(`Error fetching guide ${id}`, e);
      return undefined;
    } finally {
      setLoadingGuides(prev => ({ ...prev, [id]: false }));
    }
  };

  const fetchRelatedAudio = async (
    localizedName: string,
    collectionCode: string,
    allResources: ResourceItem[]
  ): Promise<number | undefined> => {
    const audioItem = allResources.find(
      item =>
        item.localizedName === localizedName &&
        item.mediaType === 'Audio' &&
        item.grouping.collectionCode === collectionCode
    );

    if (audioItem && !guideContents[audioItem.id]) {
      await fetchGuideContent(audioItem.id);
    }

    return audioItem?.id;
  };

  return {
    guideContents,
    loadingGuides,
    relatedAudioIds,
    setRelatedAudioIds,
    fetchGuideContent,
    fetchRelatedAudio,
  };
};

interface AssociationResponse {
  resourceAssociations?: Array<{
    referenceId: number;
    contentId: number;
  }>;
}

// Hook for resource dialog
export const useResourceDialog = () => {
  const [resourceDialog, setResourceDialog] = useState<GuideContent | null>(null);
  const [loadingResourceDialog, setLoadingResourceDialog] = useState(false);

  const handleResourceClick = async (resourceId: number, parentResourceId?: number | null) => {
    setLoadingResourceDialog(true);
    setResourceDialog(null);

    try {
      let finalResourceId = resourceId;

      if (parentResourceId !== null && parentResourceId !== undefined) {
        const associationsRes = await fetch(
          `${API_BASE_URL}/resources/${parentResourceId}/associations`,
          { method: 'GET', mode: 'cors' }
        );

        if (!associationsRes.ok) throw new Error('Failed to fetch resource associations');
        const associations = (await associationsRes.json()) as AssociationResponse;

        const matchingAssociation = associations.resourceAssociations?.find(assoc => {
          return Number(assoc.referenceId) === Number(resourceId);
        });

        if (matchingAssociation?.contentId) {
          finalResourceId = matchingAssociation.contentId;
        } else {
          throw new Error('Resource association not found');
        }
      }

      const res = await fetch(`${API_BASE_URL}/resources/${finalResourceId}`, {
        method: 'GET',
        mode: 'cors',
      });
      if (!res.ok) throw new Error('Failed to fetch resource');
      const data = (await res.json()) as GuideContent;
      setResourceDialog(data);
    } catch (e) {
      console.error(`Error fetching resource ${resourceId}`, e);
      alert('Failed to load resource');
    } finally {
      setLoadingResourceDialog(false);
    }
  };

  const closeDialog = () => {
    setResourceDialog(null);
  };

  return {
    resourceDialog,
    loadingResourceDialog,
    handleResourceClick,
    closeDialog,
  };
};
