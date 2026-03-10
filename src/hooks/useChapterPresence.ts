import { useCallback, useEffect, useRef, useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { config } from '@/lib/config';

interface PresenceResponse {
  isFirstEditor: boolean;
  firstEditorName: string | null;
}

const HEARTBEAT_INTERVAL_MS = 30 * 1000; // 30 seconds

export const useChapterPresence = (
  chapterAssignmentId: number,
  isActive: boolean,
  userEmail: string
) => {
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCleanedUpRef = useRef(false);

  const heartbeatMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) return null;

      const res = await fetch(`${config.api.url}/heartbeat/${chapterAssignmentId}/presence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        credentials: 'omit',
      });

      if (res.status === 401) return null;
      if (!res.ok) throw new Error('Failed to send heartbeat');

      return (await res.json()) as PresenceResponse;
    },
    onSuccess: data => {
      if (data && !data.isFirstEditor && data.firstEditorName) {
        setWarningMessage(`${data.firstEditorName} is editing this resource.`);
      } else {
        setWarningMessage(null);
      }
    },
    onError: err => {
      console.error('Presence heartbeat failed:', err);
    },
  });

  const cleanup = useCallback(() => {
    if (isCleanedUpRef.current || !userEmail || !chapterAssignmentId) return;
    isCleanedUpRef.current = true;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    void fetch(`${config.api.url}/heartbeat/${chapterAssignmentId}/presence`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
      },
      keepalive: true,
      credentials: 'omit',
    }).catch(err => {
      console.error('Presence cleanup failed:', err);
    });
  }, [chapterAssignmentId, userEmail]);

  useEffect(() => {
    if (!isActive || !chapterAssignmentId || !userEmail) return;

    isCleanedUpRef.current = false;

    heartbeatMutation.mutate();

    intervalRef.current = setInterval(() => {
      heartbeatMutation.mutate();
    }, HEARTBEAT_INTERVAL_MS);

    const handleBeforeUnload = () => cleanup();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterAssignmentId, isActive, userEmail]);

  return { warningMessage };
};
