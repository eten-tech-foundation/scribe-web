import { Loader2 } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { TipTapRenderer } from '@/layouts/resources/TipTapRenderer';
import {
  type AudioContent,
  type AudioStep,
  type ContentItem,
  type GuideContent,
  type ResourceItem,
} from '@/lib/types';

interface TextResourceAccordionProps {
  resources: ResourceItem[];
  guideContents: Record<number, GuideContent>;
  loadingGuides: Record<number, boolean>;
  relatedAudioIds: Record<number, number | null>;
  onAccordionChange: (value: string | undefined) => void;
  onResourceClick: (resourceId: number, parentResourceId?: number | null) => void;
  openItem: string | null;
}

const isAudioContent = (content: GuideContent['content']): content is AudioContent => {
  return (
    content !== null &&
    typeof content === 'object' &&
    !Array.isArray(content) &&
    ('mp3' in content || 'webm' in content)
  );
};

const isContentItemArray = (content: GuideContent['content']): content is ContentItem[] => {
  return Array.isArray(content);
};

export const TextResourceAccordion: React.FC<TextResourceAccordionProps> = ({
  resources,
  guideContents,
  loadingGuides,
  relatedAudioIds,
  onAccordionChange,
  onResourceClick,
  openItem,
}) => {
  return (
    <div className='h-full space-y-2'>
      <Accordion
        collapsible
        type='single'
        value={openItem ?? undefined}
        onValueChange={onAccordionChange}
      >
        {resources.map(sv => {
          const relatedAudioId = relatedAudioIds[sv.id];
          const audioContent = relatedAudioId ? guideContents[relatedAudioId] : null;
          const audioData =
            audioContent && isAudioContent(audioContent.content) ? audioContent.content : null;

          return (
            <AccordionItem key={sv.id} value={sv.id.toString()}>
              <AccordionTrigger className='hover:bg-muted/50 px-4'>
                {sv.localizedName}
              </AccordionTrigger>
              <AccordionContent className='px-4 pb-4'>
                {loadingGuides[sv.id] ? (
                  <div className='flex items-center justify-center py-8'>
                    <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
                  </div>
                ) : guideContents[sv.id] ? (
                  <div>
                    {isContentItemArray(guideContents[sv.id].content) ? (
                      <div className='space-y-6'>
                        {(guideContents[sv.id].content as ContentItem[]).map((contentItem, idx) => {
                          if (!contentItem?.tiptap) return null;

                          const stepNumber = contentItem.stepNumber;
                          const audioStep = audioData?.mp3?.steps?.find(
                            (s: AudioStep) => s.stepNumber === stepNumber
                          );
                          const webmStep = audioData?.webm?.steps?.find(
                            (s: AudioStep) => s.stepNumber === stepNumber
                          );

                          return (
                            <div
                              key={idx}
                              className='border-b border-gray-100 pb-4 last:border-b-0'
                            >
                              {stepNumber && (
                                <div className='mb-2 text-sm font-semibold text-blue-600'>
                                  Step {stepNumber}
                                </div>
                              )}
                              <TipTapRenderer
                                content={contentItem.tiptap}
                                parentResourceId={sv.id}
                                onResourceClick={onResourceClick}
                              />

                              {audioStep && (
                                <div className='mt-4 border-t border-gray-200 pt-3'>
                                  <div className='mb-2 text-xs text-gray-600'>
                                    Audio for Step {stepNumber}
                                  </div>
                                  <audio controls className='w-full'>
                                    {webmStep?.url && (
                                      <source src={webmStep.url} type='audio/webm' />
                                    )}
                                    <source src={audioStep.url} type='audio/mpeg' />
                                    Your browser does not support the audio element.
                                  </audio>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : !isAudioContent(guideContents[sv.id].content) ? (
                      <p className='text-sm text-gray-500'>No text content available</p>
                    ) : null}
                  </div>
                ) : (
                  <p className='text-sm text-gray-500'>Failed to load content</p>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
