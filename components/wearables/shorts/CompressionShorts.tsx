interface CompressionShortsProps {
  color?: string;
}

export default function CompressionShorts({ color = '#1F2937' }: CompressionShortsProps) {
  const accentColor = '#111827';

  return (
    <g>
      {/* Compression shorts - longer, tight fit */}
      <rect x="68" y="135" width="64" height="40" rx="3" fill={color} />
      <line
        x1="100"
        y1="135"
        x2="100"
        y2="175"
        stroke={accentColor}
        strokeWidth="2"
      />
    </g>
  );
}
