# Wearables Components

This directory contains modular SVG components for character customization in Sporty Gotchi.

## Directory Structure

```
wearables/
├── hats/
│   ├── BaseballCap.tsx
│   ├── Beanie.tsx
│   ├── Visor.tsx
│   └── Headband.tsx
├── shirts/
│   ├── TankTop.tsx
│   ├── TShirt.tsx
│   ├── Jersey.tsx
│   └── Jacket.tsx
├── shorts/
│   ├── RunningShorts.tsx
│   ├── CompressionShorts.tsx
│   └── BikeShorts.tsx
└── shoes/
    ├── RunningShoes.tsx
    ├── TrailShoes.tsx
    └── TrackSpikes.tsx
```

## Component Architecture

Each wearable item is a self-contained React component that:
- Returns SVG `<g>` elements (or fragments containing SVG elements)
- Accepts optional `color` prop for customization
- Has default colors matching the current design
- Can be easily imported and rendered in the main character component

## Usage Example

```tsx
import BaseballCap from './wearables/hats/BaseballCap';

// In your SVG:
<svg>
  {/* Other character elements */}

  {wearables?.hat === 'cap' && <BaseballCap />}

  {/* With custom color */}
  {wearables?.hat === 'cap' && <BaseballCap color="#FF5733" />}
</svg>
```

## Adding New Wearables

To add a new wearable item:

1. **Create the component file** in the appropriate category folder
2. **Define the interface** with optional color props
3. **Design the SVG elements** that make up the wearable
4. **Export the component** as default
5. **Import in SportyGotchi.tsx** and add the conditional rendering logic
6. **Update Locker.tsx** to include the new item in the UI

### Example: Adding a New Hat

```tsx
// components/wearables/hats/Snapback.tsx
interface SnapbackProps {
  color?: string;
}

export default function Snapback({ color = '#2563EB' }: SnapbackProps) {
  const accentColor = '#1E40AF';

  return (
    <g>
      {/* Your SVG elements here */}
      <ellipse cx="100" cy="20" rx="38" ry="14" fill={color} />
      <rect x="80" y="22" width="40" height="5" rx="2" fill={accentColor} />
    </g>
  );
}
```

Then in `SportyGotchi.tsx`:

```tsx
import Snapback from './wearables/hats/Snapback';

// In the render logic:
{wearables.hat === 'snapback' && <Snapback />}
```

## Design Guidelines

1. **Coordinate System**: Use the 200x200 viewBox coordinate system
2. **Positioning**:
   - Hats: around y=20 (top of head)
   - Shirts: around y=95-150 (torso)
   - Shorts: around y=135-175 (lower torso)
   - Shoes: around y=195 (feet)
3. **Colors**: Use hex colors with optional props for customization
4. **Details**: Add small details (stripes, logos, textures) to make items unique
5. **Scaling**: Keep proportions consistent with the character body

## Future Enhancements

Potential improvements for the wearables system:

1. **Color Customization**: Allow users to select colors for each item
2. **Unlockable Items**: Add achievement-based unlocks (e.g., unlock trail shoes after 100km)
3. **Seasonal Items**: Special items for holidays or events
4. **Rarity System**: Common, rare, epic items with visual effects
5. **SVG Imports**: Support importing custom SVG files from design tools
6. **Animations**: Add subtle animations to certain items (flowing cape, bouncing hat)
7. **Layering System**: More complex layering for items that interact (jacket over shirt)
8. **Brand Partnerships**: Branded items from running/cycling companies

## Technical Notes

- All components are client-side rendered (`'use client'` in parent)
- SVG elements are rendered within the main character SVG context
- Components use TypeScript interfaces for type safety
- Default colors match the current Sporty Gotchi design language
- Performance is optimized by only rendering selected items
