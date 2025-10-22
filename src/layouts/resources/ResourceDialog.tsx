import { Loader2 } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TipTapRenderer } from '@/layouts/resources/TipTapRenderer';
import { type ContentItem, type GuideContent } from '@/lib/types';

interface ResourceDialogProps {
  resource: GuideContent | null;
  loading: boolean;
  onClose: () => void;
  onResourceClick: (resourceId: number, parentResourceId?: number | null) => void;
}

export const ResourceDialog: React.FC<ResourceDialogProps> = ({
  resource,
  loading,
  onClose,
  onResourceClick,
}) => {
  return (
    <Dialog open={!!resource || loading} onOpenChange={onClose}>
      <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{resource?.localizedName ?? 'Loading...'}</DialogTitle>
        </DialogHeader>

        <div className='py-4'>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
            </div>
          ) : resource ? (
            <div>
              {Array.isArray(resource.content) ? (
                <div className='space-y-6'>
                  {(resource.content as ContentItem[]).map((contentItem, idx) => {
                    if (contentItem?.tiptap) {
                      const stepNumber = contentItem.stepNumber;
                      const audioStep = resource.content?.mp3?.steps?.find(
                        s => s.stepNumber === stepNumber
                      );
                      const webmStep = resource.content?.webm?.steps?.find(
                        s => s.stepNumber === stepNumber
                      );

                      return (
                        <div key={idx} className='border-b border-gray-100 pb-4 last:border-b-0'>
                          {stepNumber && (
                            <div className='mb-2 text-sm font-semibold text-blue-600'>
                              Step {stepNumber}
                            </div>
                          )}
                          <TipTapRenderer
                            content={contentItem.tiptap}
                            parentResourceId={resource.id}
                            onResourceClick={onResourceClick}
                          />

                          {audioStep && (
                            <div className='mt-4 border-t border-gray-200 pt-3'>
                              <div className='mb-2 text-xs text-gray-600'>
                                Audio for Step {stepNumber}
                              </div>
                              <audio controls className='w-full'>
                                {webmStep?.url && <source src={webmStep.url} type='audio/webm' />}
                                <source src={audioStep.url} type='audio/mpeg' />
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          )}
                        </div>
                      );
                    } else if (contentItem?.url) {
                      return (
                        <img
                          key={idx}
                          alt={resource.localizedName}
                          className='h-auto max-w-full rounded'
                          src={contentItem.url}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              ) : resource.content?.mp3 ? null : (
                <p className='text-gray-500'>No content available</p>
              )}

              {resource.content?.mp3 && !Array.isArray(resource.content) && (
                <div className='mb-6'>
                  {resource.content.mp3.steps && Array.isArray(resource.content.mp3.steps) ? (
                    <div className='space-y-3'>
                      {resource.content.mp3.steps.map(step => (
                        <div key={step.stepNumber}>
                          <div className='mb-1 text-xs text-gray-600'>Step {step.stepNumber}</div>
                          <audio controls className='w-full'>
                            {resource.content?.webm?.steps?.find(
                              s => s.stepNumber === step.stepNumber
                            )?.url && (
                              <source
                                src={
                                  resource.content.webm.steps.find(
                                    s => s.stepNumber === step.stepNumber
                                  )?.url ?? ''
                                }
                                type='audio/webm'
                              />
                            )}
                            <source src={step.url} type='audio/mpeg' />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      ))}
                    </div>
                  ) : resource.content.mp3.url ? (
                    <audio controls className='w-full'>
                      {resource.content?.webm?.url && (
                        <source src={resource.content.webm.url} type='audio/webm' />
                      )}
                      <source src={resource.content.mp3.url} type='audio/mpeg' />
                      Your browser does not support the audio element.
                    </audio>
                  ) : null}
                </div>
              )}

              {resource.grouping && (
                <div className='mt-6 border-t border-gray-200 pt-4'>
                  <div className='text-sm text-gray-600'>
                    <strong>Source:</strong> {resource.grouping.name}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className='text-gray-500'>Failed to load resource</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
