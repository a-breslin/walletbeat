import { nonEmptyValues } from '@/types/utils/non-empty';
import { type Evaluation, Rating, type Value } from '../attributes';
import type { AtLeastOneVariant, Variant } from '../variants';

/**
 * Helper for constructing "Unrated" values.
 * @param brand Brand string to distinguish `Value` subtypes.
 */
export function unrated<T>(brand: T): Value & { __brand: T } {
  return {
    id: 'unrated',
    rating: Rating.UNRATED,
    displayName: 'Unrated',
    __brand: brand,
  };
}

/**
 * Evaluation aggregation function that picks the worst rating.
 * @param perVariant Evaluation for at least one variant.
 * @returns The evaluation with the lowest rating.
 */
export function pickWorstRating<V extends Value>(
  perVariant: AtLeastOneVariant<Evaluation<V>>
): Evaluation<V> {
  let worst: Evaluation<V> | null = null;
  for (const evaluation of nonEmptyValues<Variant, Evaluation<V>>(perVariant)) {
    if (worst === null) {
      worst = evaluation;
      continue;
    }
    if (worst.value.rating === Rating.UNRATED || worst.value.rating === Rating.YES) {
      worst = evaluation;
      continue;
    }
    if (worst.value.rating === Rating.PARTIAL && evaluation.value.rating === Rating.NO) {
      worst = evaluation;
      continue;
    }
  }
  return worst!; // eslint-disable-line @typescript-eslint/no-non-null-assertion -- Safe because perVariant must contain at least one variant.
}
