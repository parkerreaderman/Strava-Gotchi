/**
 * Wearable IDs – single source of truth for Locker, PixelCharacter, and storage.
 * Use these constants everywhere; do not hardcode 'cap', 'beanie', etc.
 */

export const HAT_IDS = ['none', 'cap', 'headband', 'beanie', 'visor'] as const;
export type HatId = (typeof HAT_IDS)[number];

export const SHIRT_IDS = ['none', 'tank', 'tshirt', 'jersey', 'jacket'] as const;
export type ShirtId = (typeof SHIRT_IDS)[number];

export const SHORTS_IDS = ['none', 'running', 'compression', 'bike'] as const;
export type ShortsId = (typeof SHORTS_IDS)[number];

export const SHOES_IDS = ['none', 'running', 'trail', 'spikes'] as const;
export type ShoesId = (typeof SHOES_IDS)[number];

export const BACKGROUND_IDS = ['default', 'track', 'mountains', 'beach', 'city', 'forest'] as const;
export type BackgroundId = (typeof BACKGROUND_IDS)[number];

export const WEARABLE_CATEGORIES = ['hats', 'shirts', 'shorts', 'shoes', 'backgrounds'] as const;
export type WearableCategory = (typeof WEARABLE_CATEGORIES)[number];

/** Map category to the key used in WearableItems */
export const CATEGORY_TO_KEY: Record<WearableCategory, keyof WearableItems> = {
  hats: 'hat',
  shirts: 'shirt',
  shorts: 'shorts',
  shoes: 'shoes',
  backgrounds: 'background',
};

export interface WearableItems {
  hat?: HatId | string;
  shirt?: ShirtId | string;
  shorts?: ShortsId | string;
  shoes?: ShoesId | string;
  background?: BackgroundId | string;
}

/** All valid wearable IDs by category (for validation and iteration) */
export const WEARABLE_IDS_BY_CATEGORY: Record<WearableCategory, readonly string[]> = {
  hats: HAT_IDS,
  shirts: SHIRT_IDS,
  shorts: SHORTS_IDS,
  shoes: SHOES_IDS,
  backgrounds: BACKGROUND_IDS,
};

/** Display metadata for Locker UI (single source of truth for ID + label) */
export const HAT_META: Record<HatId, { name: string; icon: string }> = {
  none: { name: 'None', icon: '○' },
  cap: { name: 'Baseball Cap', icon: '🧢' },
  headband: { name: 'Headband', icon: '⭕' },
  beanie: { name: 'Beanie', icon: '🎩' },
  visor: { name: 'Visor', icon: '👒' },
};

export const SHIRT_META: Record<ShirtId, { name: string; icon: string }> = {
  none: { name: 'None', icon: '○' },
  tank: { name: 'Tank Top', icon: '👕' },
  tshirt: { name: 'T-Shirt', icon: '👔' },
  jersey: { name: 'Jersey', icon: '🎽' },
  jacket: { name: 'Jacket', icon: '🧥' },
};

export const SHORTS_META: Record<ShortsId, { name: string; icon: string }> = {
  none: { name: 'None', icon: '○' },
  running: { name: 'Running Shorts', icon: '🩳' },
  compression: { name: 'Compression', icon: '👖' },
  bike: { name: 'Bike Shorts', icon: '🩳' },
};

export const SHOES_META: Record<ShoesId, { name: string; icon: string }> = {
  none: { name: 'None', icon: '○' },
  running: { name: 'Running Shoes', icon: '👟' },
  trail: { name: 'Trail Shoes', icon: '🥾' },
  spikes: { name: 'Track Spikes', icon: '⚡' },
};

export const BACKGROUND_META: Record<BackgroundId, { name: string; color: string }> = {
  default: { name: 'Default', color: 'from-gray-50 to-gray-100' },
  track: { name: 'Track & Field', color: 'from-red-100 to-orange-100' },
  mountains: { name: 'Mountains', color: 'from-blue-100 to-green-100' },
  beach: { name: 'Beach', color: 'from-yellow-100 to-blue-100' },
  city: { name: 'City', color: 'from-gray-200 to-slate-300' },
  forest: { name: 'Forest', color: 'from-green-200 to-emerald-300' },
};

export function isHatId(id: string): id is HatId {
  return (HAT_IDS as readonly string[]).includes(id);
}
export function isShirtId(id: string): id is ShirtId {
  return (SHIRT_IDS as readonly string[]).includes(id);
}
export function isShortsId(id: string): id is ShortsId {
  return (SHORTS_IDS as readonly string[]).includes(id);
}
export function isShoesId(id: string): id is ShoesId {
  return (SHOES_IDS as readonly string[]).includes(id);
}
export function isBackgroundId(id: string): id is BackgroundId {
  return (BACKGROUND_IDS as readonly string[]).includes(id);
}
