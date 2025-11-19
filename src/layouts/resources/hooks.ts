import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

interface Language {
  id: number;
  code: string;
  englishDisplay: string;
  localizedDisplay: string;
  scriptDirection: string;
}

interface AvailableLanguage {
  languageId: number;
  languageCode: string;
  displayName: string;
  resourceItemCount: number;
}

interface ResourceCollectionResponse {
  code: string;
  displayName: string;
  availableLanguages: AvailableLanguage[];
}

interface LanguageResourceCount {
  languageId: number;
  languageCode: string;
  resourceCounts: Array<{
    type: string;
    count: number;
  }>;
}

export interface LanguageOption {
  id: number;
  code: string;
  display: string;
  englishDisplay?: string;
  itemCount: number;
  scriptDirection: 'LTR' | 'RTL';
}

interface AssociationResponse {
  resourceAssociations?: Array<{
    referenceId: number;
    contentId: number;
  }>;
}

// Hook for fetching available languages for a resource collection
export const useResourceLanguages = (
  selectedResource: ResourceName,
  sourceLanguageCode: string,
  sourceData: ProjectItem
) => {
  const [availableLanguages, setAvailableLanguages] = useState<LanguageOption[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [allLanguagesCache, setAllLanguagesCache] = useState<Language[]>([]);

  // Track the current resource + chapter to avoid unnecessary refetches
  const lastFetchKeyRef = useRef<string>('');
  const currentFetchKey = `${sourceData.bookCode}-${sourceData.chapterNumber}-${selectedResource.id}`;

  // Fetch all languages once per chapter
  useEffect(() => {
    const fetchAllLanguages = async () => {
      if (allLanguagesCache.length > 0) return;

      try {
        const languagesRes = await fetch(`${API_BASE_URL}/languages`, {
          method: 'GET',
          mode: 'cors',
        });
        if (!languagesRes.ok) throw new Error('Failed to fetch languages');
        const allLanguages = (await languagesRes.json()) as Language[];
        setAllLanguagesCache(allLanguages);
      } catch (error) {
        console.error('Error fetching all languages:', error);
      }
    };

    void fetchAllLanguages();
  }, [allLanguagesCache.length]);

  // Fetch available languages based on resource type
  useEffect(() => {
    const isTranslationNotes = selectedResource.id === 'UWTranslationNotes';
    const isImages = selectedResource.name === 'Images';

    // Clear languages for non-supported resources
    if (!isTranslationNotes && !isImages) {
      setAvailableLanguages([]);
      setSelectedLanguage('');
      lastFetchKeyRef.current = '';
      return;
    }

    if (allLanguagesCache.length === 0) {
      return;
    }

    // Skip if already fetched for this resource + chapter
    if (lastFetchKeyRef.current === currentFetchKey) {
      return;
    }

    const fetchLanguages = async () => {
      setLoadingLanguages(true);

      try {
        let languageOptions: LanguageOption[] = [];

        if (isImages) {
          // Fetch languages for entire chapter
          const availableResourcesRes = await fetch(
            `${API_BASE_URL}/languages/available-resources?bookcode=${sourceData.bookCode}&StartChapter=${sourceData.chapterNumber}&StartVerse=1&EndVerse=200&EndChapter=${sourceData.chapterNumber}`,
            { method: 'GET', mode: 'cors' }
          );

          if (!availableResourcesRes.ok) throw new Error('Failed to fetch available resources');
          const availableResourcesData =
            (await availableResourcesRes.json()) as LanguageResourceCount[];

          languageOptions = availableResourcesData
            .filter(langData => {
              const imagesCount = langData.resourceCounts.find(rc => rc.type === 'Images');
              return imagesCount && imagesCount.count > 0;
            })
            .map(langData => {
              const langInfo = allLanguagesCache.find(l => l.id === langData.languageId);
              const imagesCount =
                langData.resourceCounts.find(rc => rc.type === 'Images')?.count ?? 0;

              return {
                id: langData.languageId,
                code: langData.languageCode,
                display: langInfo?.localizedDisplay ?? langData.languageCode,
                englishDisplay: langInfo?.englishDisplay,
                itemCount: imagesCount,
                scriptDirection: langInfo?.scriptDirection
                  ? (langInfo.scriptDirection as 'LTR' | 'RTL')
                  : 'LTR',
              };
            });
        } else if (isTranslationNotes) {
          // Fetch languages for translation notes collection
          const collectionRes = await fetch(
            `${API_BASE_URL}/resources/collections/${selectedResource.id}`,
            { method: 'GET', mode: 'cors' }
          );

          if (!collectionRes.ok) throw new Error('Failed to fetch resource collection');
          const collectionData = (await collectionRes.json()) as ResourceCollectionResponse;

          languageOptions = collectionData.availableLanguages.map(availLang => {
            const langInfo = allLanguagesCache.find(l => l.id === availLang.languageId);

            return {
              id: availLang.languageId,
              code: availLang.languageCode,
              display: langInfo?.localizedDisplay ?? availLang.displayName,
              englishDisplay: langInfo?.englishDisplay,
              itemCount: availLang.resourceItemCount,
              scriptDirection: langInfo?.scriptDirection
                ? (langInfo.scriptDirection as 'LTR' | 'RTL')
                : 'LTR',
            };
          });
        }

        // Always include source language
        const sourceLanguageInfo = allLanguagesCache.find(l => l.code === sourceLanguageCode);
        const hasSourceLanguage = languageOptions.some(l => l.code === sourceLanguageCode);

        if (!hasSourceLanguage && sourceLanguageInfo) {
          languageOptions.unshift({
            id: sourceLanguageInfo.id,
            code: sourceLanguageInfo.code,
            display: sourceLanguageInfo.localizedDisplay,
            englishDisplay: sourceLanguageInfo.englishDisplay,
            itemCount: 0,
            scriptDirection: sourceLanguageInfo.scriptDirection as 'LTR' | 'RTL',
          });
        }

        setAvailableLanguages(languageOptions);
        lastFetchKeyRef.current = currentFetchKey;
      } catch (error) {
        console.error('Error fetching languages:', error);
        setAvailableLanguages([]);
        setSelectedLanguage('');
      } finally {
        setLoadingLanguages(false);
      }
    };

    void fetchLanguages();
  }, [
    selectedResource.id,
    selectedResource.name,
    sourceLanguageCode,
    sourceData.bookCode,
    sourceData.chapterNumber,
    allLanguagesCache,
    currentFetchKey,
  ]);

  const handleLanguageChange = useCallback((languageCode: string) => {
    setSelectedLanguage(languageCode);
  }, []);

  const currentLanguageDirection = useMemo(
    () => availableLanguages.find(l => l.code === selectedLanguage)?.scriptDirection ?? 'LTR',
    [availableLanguages, selectedLanguage]
  );

  return {
    availableLanguages,
    selectedLanguage,
    loadingLanguages,
    handleLanguageChange,
    currentLanguageDirection,
  };
};

// Hook for fetching resources (content for specific verse)
export const useResourceFetch = (
  selectedResource: ResourceName,
  activeVerseId: number,
  sourceData: ProjectItem,
  selectedLanguage?: string
) => {
  const [localizeRefName, setLocalizeRefName] = useState<ResourceItem[]>([]);
  const [imageItems, setImageItems] = useState<ItemWithUrl[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    // Don't fetch if no language selected
    if (!selectedLanguage) {
      setLocalizeRefName([]);
      setImageItems([]);
      return;
    }

    const fetchResources = async () => {
      const isImageResource = selectedResource.name === 'Images';
      const languageCode = selectedLanguage || sourceData.sourceLangCode;

      if (isImageResource) {
        setLoadingImages(true);
        try {
          const response = await fetch(
            `${API_BASE_URL}/resources/search?BookCode=${sourceData.bookCode}&StartChapter=${sourceData.chapterNumber}&EndChapter=${sourceData.chapterNumber}&LanguageCode=${languageCode}&StartVerse=${activeVerseId}&EndVerse=${activeVerseId}&ResourceType=${selectedResource.id}&Limit=100`,
            { method: 'GET', mode: 'cors' }
          );

          if (!response.ok) {
            console.error('Failed to fetch resources');
            setImageItems([]);
            setLocalizeRefName([]);
            return;
          }

          const data = (await response.json()) as FetchResponse;

          // Fetch URLs for all images
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
          setImageItems([]);
          setLocalizeRefName([]);
        } finally {
          setLoadingImages(false);
        }
      } else {
        // Fetch translation notes
        try {
          const response = await fetch(
            `${API_BASE_URL}/resources/search?BookCode=${sourceData.bookCode}&StartChapter=${sourceData.chapterNumber}&EndChapter=${sourceData.chapterNumber}&LanguageCode=${languageCode}&StartVerse=${activeVerseId}&EndVerse=${activeVerseId}&ResourceCollectionCode=${selectedResource.id}&Limit=100`,
            { method: 'GET', mode: 'cors' }
          );

          if (!response.ok) {
            console.error('Failed to fetch resources');
            setLocalizeRefName([]);
            setImageItems([]);
            return;
          }

          const data = (await response.json()) as FetchResponse;
          setLocalizeRefName(data.items as ResourceItem[]);
          setImageItems([]);
        } catch (error) {
          console.error('Error fetching resources:', error);
          setLocalizeRefName([]);
          setImageItems([]);
        }
      }
    };

    void fetchResources();
  }, [selectedResource, activeVerseId, sourceData, selectedLanguage]);

  return { localizeRefName, imageItems, loadingImages };
};

// Hook for managing guide content
export const useGuideContent = () => {
  const [guideContents, setGuideContents] = useState<Record<number, GuideContent>>({});
  const [loadingGuides, setLoadingGuides] = useState<Record<number, boolean>>({});
  const [relatedAudioIds, setRelatedAudioIds] = useState<Record<number, number | null>>({});

  const fetchGuideContent = async (id: number): Promise<GuideContent | undefined> => {
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

    if (audioItem) {
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

// Hook for resource dialog
export const useResourceDialog = () => {
  const [resourceDialog, setResourceDialog] = useState<GuideContent | null>(null);
  const [loadingResourceDialog, setLoadingResourceDialog] = useState(false);
  const [resourceError, setResourceError] = useState(false);

  const handleResourceClick = async (resourceId: number, parentResourceId?: number | null) => {
    setLoadingResourceDialog(true);
    setResourceDialog(null);
    setResourceError(false);

    try {
      let finalResourceId = resourceId;

      if (parentResourceId != null) {
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
      setResourceError(true);
      setResourceDialog({
        id: resourceId,
        name: '',
        localizedName: '',
        content: {},
        grouping: {
          collectionCode: '',
        },
      });
    } finally {
      setLoadingResourceDialog(false);
    }
  };

  const closeDialog = () => {
    setResourceDialog(null);
    setResourceError(false);
  };

  return {
    resourceDialog,
    loadingResourceDialog,
    resourceError,
    handleResourceClick,
    closeDialog,
  };
};
