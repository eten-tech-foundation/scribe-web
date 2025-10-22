import React from 'react';

import type { TipTapMark, TipTapNode } from '@/lib/types';

interface TipTapRendererProps {
  content: TipTapNode;
  onResourceClick?: (resourceId: number, parentResourceId?: number) => void;
  parentResourceId?: number;
}

export const TipTapRenderer: React.FC<TipTapRendererProps> = ({
  content,
  onResourceClick,
  parentResourceId,
}) => {
  const renderNode = (node: TipTapNode, index: number): React.ReactNode => {
    if (!node) return null;

    switch (node.type) {
      case 'doc':
        return (
          <div key={index} className='space-y-4'>
            {node.content?.map((child, i) => renderNode(child, i))}
          </div>
        );

      case 'heading': {
        const level = node.attrs?.level ?? 1;
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        const headingClasses: Record<number, string> = {
          1: 'text-2xl font-bold text-gray-900 mb-3',
          2: 'text-xl font-semibold text-gray-800 mb-2 mt-4',
          3: 'text-lg font-semibold text-gray-800 mb-2',
          4: 'text-base font-semibold text-gray-800 mb-2',
          5: 'text-sm font-semibold text-gray-800 mb-2',
        };
        return (
          <HeadingTag key={index} className={headingClasses[level] ?? headingClasses[1]}>
            {node.content?.map((child, i) => renderNode(child, i))}
          </HeadingTag>
        );
      }

      case 'paragraph': {
        const indentClass = node.attrs?.indent ? `ml-${node.attrs.indent * 4}` : '';
        return (
          <p key={index} className={`mb-2 leading-relaxed text-gray-700 ${indentClass}`}>
            {node.content?.map((child, i) => renderNode(child, i))}
          </p>
        );
      }

      case 'bulletList': {
        const bulletIndent = node.attrs?.indent ? `ml-${node.attrs.indent * 4}` : 'ml-6';
        return (
          <ul key={index} className={`list-disc ${bulletIndent} mb-3 space-y-1`}>
            {node.content?.map((child, i) => renderNode(child, i))}
          </ul>
        );
      }

      case 'orderedList': {
        const orderedIndent = node.attrs?.indent ? `ml-${node.attrs.indent * 4}` : 'ml-6';
        return (
          <ol
            key={index}
            className={`list-decimal ${orderedIndent} mb-3 space-y-1`}
            start={node.attrs?.start ?? 1}
          >
            {node.content?.map((child, i) => renderNode(child, i))}
          </ol>
        );
      }

      case 'listItem':
        return (
          <li key={index} className='text-gray-700'>
            {node.content?.map((child, i) => renderNode(child, i))}
          </li>
        );

      case 'blockquote': {
        const blockquoteIndent = node.attrs?.indent ? `ml-${node.attrs.indent * 4}` : '';
        return (
          <blockquote
            key={index}
            className={`my-3 border-l-4 border-gray-300 pl-4 text-gray-600 italic ${blockquoteIndent}`}
          >
            {node.content?.map((child, i) => renderNode(child, i))}
          </blockquote>
        );
      }

      case 'image':
        return (
          <img
            key={index}
            alt={node.attrs?.alt ?? ''}
            className='my-4 h-auto max-w-full rounded'
            src={node.attrs?.src}
          />
        );

      case 'video':
        return (
          <video
            key={index}
            controls
            className='my-4 h-auto max-w-full rounded'
            src={node.attrs?.src}
          >
            Your browser does not support the video element.
          </video>
        );

      case 'OpenTranslatorsNotesSection':
      case 'OpenTranslatorsNotesParagraph':
      case 'OpenTranslatorsNotesGeneralComment':
        return (
          <div key={index} className='my-4 border-l-4 border-blue-400 bg-blue-50 py-2 pl-4'>
            {node.content?.map((child, i) => renderNode(child, i))}
          </div>
        );

      case 'OpenTranslatorsNotesTranslationOptions':
        return (
          <div key={index} className='my-4 rounded-lg border border-green-300 bg-green-50 p-4'>
            {node.content?.map((child, i) => renderNode(child, i))}
          </div>
        );

      case 'OpenTranslatorsNotesTranslationOptionsDefaultOption':
        return (
          <div key={index} className='mb-3'>
            <div className='mb-1 text-xs font-semibold text-green-700'>Default Translation:</div>
            {node.content?.map((child, i) => renderNode(child, i))}
          </div>
        );

      case 'OpenTranslatorsNotesTranslationOptionsAdditionalTranslationOptions':
        return (
          <div key={index}>
            <div className='mb-1 text-xs font-semibold text-green-700'>
              Alternative Translations:
            </div>
            <ul className='ml-6 list-disc space-y-1'>
              {node.content?.map((child, i) => renderNode(child, i))}
            </ul>
          </div>
        );

      case 'text': {
        const text = node.text ?? '';

        if (node.marks && node.marks.length > 0) {
          let element: React.ReactNode = text;
          let hasResourceRef = false;
          let resourceId: number | null = null;

          node.marks.forEach((mark: TipTapMark) => {
            if (mark.type === 'bold') {
              element = <strong className='font-semibold'>{element}</strong>;
            } else if (mark.type === 'italic') {
              element = <em className='italic'>{element}</em>;
            } else if (mark.type === 'underline') {
              element = <span className='underline'>{element}</span>;
            } else if (mark.type === 'implied') {
              element = <span className='text-gray-500 italic'>[{element}]</span>;
            } else if (mark.type === 'bibleReference') {
              element = <span className=''>{element}</span>;
            } else if (mark.type === 'resourceReference') {
              hasResourceRef = true;
              resourceId = mark.attrs?.resourceId ?? null;
            }
          });

          if (hasResourceRef && resourceId !== null) {
            return (
              <span
                key={index}
                className='cursor-pointer text-blue-600'
                onClick={() => onResourceClick?.(resourceId, parentResourceId)}
              >
                {element}
              </span>
            );
          }

          return <React.Fragment key={index}>{element}</React.Fragment>;
        }

        return <React.Fragment key={index}>{text}</React.Fragment>;
      }

      default:
        console.warn('Unknown node type:', node.type, node);
        return null;
    }
  };

  return <>{renderNode(content, 0)}</>;
};
