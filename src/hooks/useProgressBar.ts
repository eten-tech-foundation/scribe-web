import { useMemo } from 'react';

import { type WorkflowStep } from '@/lib/types';

interface ColorInfo {
  color: string;
  opacity: number;
  rgba: string;
  percentage: number;
  displayName: string;
}

interface ProgressSegment {
  status: string;
  displayName: string;
  count: number;
  widthPercentage: number;
  color: string;
  opacity: number;
}

const hexToRgba = (hex: string, opacity: number): string => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const useProgressBar = (workflowConfig: WorkflowStep[] = []) => {
  const primaryColor = useMemo(() => {
    if (typeof window !== 'undefined') {
      const cssColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary')
        .trim();
      return cssColor !== '' ? cssColor : '#0B50D0';
    }
    return '#0B50D0';
  }, []);

  const colors = useMemo(() => {
    const totalSteps = workflowConfig.length;
    const colorMap: Record<string, ColorInfo> = {};

    const minOpacity = 0.1;
    const maxOpacity = 1.0;
    const opacityRange = maxOpacity - minOpacity;

    workflowConfig.forEach((step, index) => {
      const denominator = Math.max(totalSteps - 1, 1);
      const increment = opacityRange / denominator;
      const opacity = minOpacity + increment * index;

      colorMap[step.id] = {
        color: primaryColor,
        opacity,
        rgba: hexToRgba(primaryColor, opacity),
        percentage: Math.round(opacity * 100),
        displayName: step.label,
      };
    });

    return colorMap;
  }, [workflowConfig, primaryColor]);

  const calculateProgressSegments = useMemo(
    () =>
      (chapterStatusCounts: Record<string, number>): ProgressSegment[] => {
        const totalChapters = Object.values(chapterStatusCounts).reduce(
          (sum, count) => sum + count,
          0
        );

        if (totalChapters === 0) return [];

        const reversedConfig = [...workflowConfig].reverse();

        return reversedConfig
          .map(step => {
            const count = chapterStatusCounts[step.id] ?? 0;
            const widthPercentage = (count / totalChapters) * 100;
            const stepColor = colors[step.id];

            return {
              status: step.id,
              displayName: stepColor.displayName,
              count,
              widthPercentage,
              color: stepColor.rgba,
              opacity: stepColor.opacity,
            };
          })
          .filter((segment): segment is ProgressSegment => segment.count > 0);
      },
    [workflowConfig, colors]
  );

  return {
    colors,
    calculateProgressSegments,
  };
};

export default useProgressBar;
