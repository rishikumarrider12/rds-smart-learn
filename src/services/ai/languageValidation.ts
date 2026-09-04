import { LearningLanguage } from './aiTypes';

/**
 * Lightweight script validation for AI-generated academic content.
 * Purpose: catch obvious language mismatches (e.g. requested Telugu but the
 * question came back entirely in English) WITHOUT rejecting legitimate
 * mathematical notation, numbers, formulas, punctuation or proper nouns.
 */

const TELUGU_RE = /[\u0C00-\u0C7F]/;
const DEVANAGARI_RE = /[\u0900-\u097F]/;

/** True when the text contains at least some script characters of `language`. */
export function textMatchesLanguage(text: string, language: LearningLanguage): boolean {
  if (language === 'Telugu') return TELUGU_RE.test(text);
  if (language === 'Hindi') return DEVANAGARI_RE.test(text);
  return true; // English: Latin script assumed; never reject numerics/symbols
}

/**
 * Validates a batch of generated content strings against the requested
 * language. For Telugu/Hindi at least `minRatio` (default 0.6) of the
 * non-empty texts must contain the expected script. English always passes.
 */
export function validateGeneratedLanguage(
  texts: string[],
  language: LearningLanguage,
  minRatio = 0.6
): boolean {
  if (language === 'English') return true;
  const list = (texts || []).filter((t) => typeof t === 'string' && t.trim().length > 0);
  if (list.length === 0) return false;
  const matches = list.filter((t) => textMatchesLanguage(t, language)).length;
  return matches / list.length >= minRatio;
}
