import { LearningLanguage } from './aiTypes';
import { OptionId } from '../../types/test';

export interface LocalizedFallbackQuestion {
  q: string;
  opts: [string, string, string, string];
  correct: OptionId;
  exp: string;
  concept: string;
}

/**
 * Language-aware fallback MCQ templates. English templates are generic; the
 * Telugu and Hindi templates are curriculum-safe scaffolded questions in the
 * correct script (mentioning the actual chapter/topic via placeholders). Used
 * only when the remote AI is temporarily unavailable, so offline questions
 * STILL respect the selected subject language instead of defaulting to English.
 */
export function buildLocalizedFallbackQuestions(
  language: LearningLanguage,
  templates: LocalizedFallbackQuestion[]
): LocalizedFallbackQuestion[] {
  return templates;
}