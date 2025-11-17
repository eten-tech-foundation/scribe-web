import { useCallback, useEffect, useRef } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { config } from '@/lib/config';

// GET response format (flat structure)
interface FetchResourceState {
  activeResource: string;
  languageCode: string;
  tabStatus: boolean;
}

// PUT request format (wrapped in resources)
interface ResourceState {
  resources: {
    activeResource: string;
    languageCode: string;
    tabStatus: boolean;
  };
}

interface SaveResourceStateParams {
  chapterAssignmentId: number;
  resourceState: ResourceState;
  email: string;
}

// Fetch resource state
const fetchResourceState = async (
  chapterAssignmentId: number,
  email: string
): Promise<FetchResourceState | null> => {
  const response = await fetch(
    `${config.api.url}/chapter-assignments/${chapterAssignmentId}/editor-state`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': email,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch resource state');
  }

  return (await response.json()) as FetchResourceState | null;
};

// Save resource state
const saveResourceState = async ({
  chapterAssignmentId,
  resourceState,
  email,
}: SaveResourceStateParams): Promise<void> => {
  console.log('Saving resource state:', resourceState);
  const response = await fetch(
    `${config.api.url}/chapter-assignments/${chapterAssignmentId}/editor-state`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': email,
      },
      body: JSON.stringify(resourceState),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to save resource state');
  }
};

// Hook to fetch resource state
export const useResourceState = (chapterAssignmentId: number, email: string) => {
  console.log('Using resource state hook for chapterAssignmentId:', chapterAssignmentId);

  return useQuery<FetchResourceState | null>({
    queryKey: ['resource-state', chapterAssignmentId],
    queryFn: () => fetchResourceState(chapterAssignmentId, email),
    enabled: !!chapterAssignmentId && !!email,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
};

// Hook to save resource state
export const useSaveResourceState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveResourceState,
    onSuccess: (_, variables) => {
      // Update cache with the flat structure (matching GET response)
      queryClient.setQueryData<FetchResourceState | null>(
        ['resource-state', variables.chapterAssignmentId],
        variables.resourceState.resources
      );
    },
    onError: error => {
      console.error('Error saving resource state:', error);
    },
  });
};

interface UseResourceStatePersistenceProps {
  chapterAssignmentId: number;
  selectedResourceId: string;
  selectedLanguage: string;
  showResources: boolean;
  userEmail: string;
  enabled?: boolean;
}

export const useResourceStatePersistence = ({
  chapterAssignmentId,
  selectedResourceId,
  selectedLanguage,
  showResources,
  userEmail,
  enabled = true,
}: UseResourceStatePersistenceProps) => {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveMutation = useSaveResourceState();

  // Track the last saved state to prevent unnecessary saves
  const lastSavedStateRef = useRef<FetchResourceState | null>(null);

  // Track if this is the first run after being enabled
  const isFirstRunRef = useRef(true);

  const saveState = useCallback(() => {
    // Skip the first run to prevent saving immediately after initialization
    if (isFirstRunRef.current) {
      console.log('First run - initializing lastSavedStateRef without saving');
      const currentState: FetchResourceState = {
        activeResource: selectedResourceId,
        languageCode: selectedLanguage,
        tabStatus: showResources,
      };
      lastSavedStateRef.current = currentState;
      isFirstRunRef.current = false;
      return;
    }

    const currentState: FetchResourceState = {
      activeResource: selectedResourceId,
      languageCode: selectedLanguage,
      tabStatus: showResources,
    };

    // Check if state actually changed from last saved state
    if (lastSavedStateRef.current) {
      const hasChanged =
        lastSavedStateRef.current.activeResource !== currentState.activeResource ||
        lastSavedStateRef.current.languageCode !== currentState.languageCode ||
        lastSavedStateRef.current.tabStatus !== currentState.tabStatus;

      if (!hasChanged) {
        console.log('State unchanged - skipping save');
        return;
      }
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout (1 second debounce)
    console.log('State changed - scheduling save');
    saveTimeoutRef.current = setTimeout(() => {
      // Wrap in resources object for PUT request
      saveMutation.mutate({
        chapterAssignmentId,
        resourceState: {
          resources: currentState,
        },
        email: userEmail,
      });
      lastSavedStateRef.current = currentState;
    }, 1000);
  }, [
    chapterAssignmentId,
    selectedResourceId,
    selectedLanguage,
    showResources,
    userEmail,
    saveMutation,
  ]);

  useEffect(() => {
    if (!enabled) {
      // Reset first run flag when disabled
      isFirstRunRef.current = true;
      return;
    }

    saveState();

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [enabled, saveState]);

  return {
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
  };
};
