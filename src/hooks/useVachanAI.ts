// import { useMutation } from '@tanstack/react-query';

// import { Logger } from '@/lib/services/logger';

// export interface TranslateParams {
//   text: string;
//   sourceLanguage: string;
//   targetLanguage: string;
//   device?: string;
//   modelName?: string;
// }

// export interface TranslateResponse {
//   translation: string;
// }

// const translateText = async (params: TranslateParams): Promise<TranslateResponse> => {
//   const { text, sourceLanguage, targetLanguage, device = 'cpu', modelName = 'nllb-600M' } = params;

//   const url = new URL('https://api.vachanengine.org/v2/ai/model/text/translate');
//   url.searchParams.set('device', device);
//   url.searchParams.set('model_name', modelName);
//   url.searchParams.set('source_language', sourceLanguage);
//   url.searchParams.set('target_language', targetLanguage);

//   const response = await fetch(url.toString(), {
//     method: 'POST',
//     mode: 'cors',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ sentence: text }),
//   });

//   if (!response.ok) throw new Error('Failed to translate text');
//   return (await response.json()) as TranslateResponse;
// };

// export const useTranslateText = () => {
//   return useMutation({
//     mutationFn: translateText,
//     onError: error => {
//       Logger.logException(error, { context: 'Error translating text' });
//     },
//   });
// };

import { useQuery } from '@tanstack/react-query';

import { config } from '@/lib/config';

export interface AITranslationResponse {
  output: string[];
}
export const fetchAITranslation = async (
  sourceLanguage: string,
  targetLanguage: string,
  verses: string[]
): Promise<AITranslationResponse> => {
  const res = await fetch(`${config.api.url}/ai-translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      verses: verses,
    }),
  });

  if (!res.ok) throw new Error('Failed to fetch bible books');

  return res.json() as Promise<AITranslationResponse>;
};

export const useVachanAI = (sourceLanguage: string, targetLanguage: string, verses: string[]) => {
  return useQuery({
    queryKey: ['ai-translation', { sourceLanguage, targetLanguage, verses }],
    queryFn: () => fetchAITranslation(sourceLanguage, targetLanguage, verses),
    enabled: !!verses.length,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
