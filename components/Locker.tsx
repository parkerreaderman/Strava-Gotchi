'use client';

import { useState } from 'react';
import {
  type WearableItems,
  type WearableCategory,
  WEARABLE_CATEGORIES,
  CATEGORY_TO_KEY,
  HAT_IDS,
  SHIRT_IDS,
  SHORTS_IDS,
  SHOES_IDS,
  BACKGROUND_IDS,
  HAT_META,
  SHIRT_META,
  SHORTS_META,
  SHOES_META,
  BACKGROUND_META,
} from '@/lib/wearables';

export type { WearableItems } from '@/lib/wearables';

interface LockerProps {
  currentItems: WearableItems;
  onItemsChange: (items: WearableItems) => void;
}

const CATEGORY_LABELS: Record<WearableCategory, { name: string; icon: string }> = {
  hats: { name: 'Hats', icon: '🧢' },
  shirts: { name: 'Shirts', icon: '👕' },
  shorts: { name: 'Shorts', icon: '🩳' },
  shoes: { name: 'Shoes', icon: '👟' },
  backgrounds: { name: 'Backgrounds', icon: '🏞️' },
};

export default function Locker({ currentItems, onItemsChange }: LockerProps) {
  const [activeCategory, setActiveCategory] = useState<WearableCategory>('hats');

  const items = {
    hats: HAT_IDS.map((id) => ({ id, ...HAT_META[id] })),
    shirts: SHIRT_IDS.map((id) => ({ id, ...SHIRT_META[id] })),
    shorts: SHORTS_IDS.map((id) => ({ id, ...SHORTS_META[id] })),
    shoes: SHOES_IDS.map((id) => ({ id, ...SHOES_META[id] })),
    backgrounds: BACKGROUND_IDS.map((id) => ({ id, ...BACKGROUND_META[id] })),
  };

  const handleSelectItem = (category: WearableCategory, itemId: string) => {
    const key = CATEGORY_TO_KEY[category];
    onItemsChange({ ...currentItems, [key]: itemId });
  };

  const categories = WEARABLE_CATEGORIES.map((id) => ({ id, ...CATEGORY_LABELS[id] }));

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
        <h2 className="text-2xl font-bold text-white">My Locker</h2>
        <p className="text-purple-100 text-sm mt-1">Customize your character&rsquo;s style</p>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-semibold transition-colors ${
                activeCategory === category.id
                  ? 'bg-purple-100 text-purple-900 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="text-xl mb-1">{category.icon}</div>
              <div className="text-xs">{category.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="p-6">
        {activeCategory === 'backgrounds' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {items.backgrounds.map((bg) => (
              <button
                key={bg.id}
                onClick={() => handleSelectItem('backgrounds', bg.id)}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  currentItems.background === bg.id
                    ? 'border-purple-600 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-full h-24 rounded-lg bg-gradient-to-br ${bg.color} mb-2`} />
                <p className="text-sm font-bold text-gray-900">{bg.name}</p>
                {currentItems.background === bg.id && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {items[activeCategory].map((item) => {
              const isSelected =
                (activeCategory === 'hats' && currentItems.hat === item.id) ||
                (activeCategory === 'shirts' && currentItems.shirt === item.id) ||
                (activeCategory === 'shorts' && currentItems.shorts === item.id) ||
                (activeCategory === 'shoes' && currentItems.shoes === item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(activeCategory, item.id)}
                  className={`relative p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <p className="text-sm font-bold text-gray-900">{item.name}</p>
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">Items Equipped:</span>
          <span className="text-purple-600 font-bold">
            {[currentItems.hat, currentItems.shirt, currentItems.shorts, currentItems.shoes, currentItems.background]
              .filter(item => item && item !== 'none' && item !== 'default').length} / 5
          </span>
        </div>
      </div>
    </div>
  );
}
