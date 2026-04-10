interface BikeShortsProps {
  color?: string;
}

export default function BikeShorts({ color = '#7C3AED' }: BikeShortsProps) {
  const accentColor = '#6D28D9';

  return (
    <g>
      {/* Bike shorts - tight, mid-length */}
      <rect x="70" y="138" width="60" height="35" rx="4" fill={color} />
      <line
        x1="100"
        y1="138"
        x2="100"
        y2="173"
        stroke={accentColor}
        strokeWidth="2"
      />
    </g>
  );
}
