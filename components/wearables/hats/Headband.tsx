interface HeadbandProps {
  color?: string;
}

export default function Headband({ color = '#FBBF24' }: HeadbandProps) {
  const accentColor = '#F59E0B';
  const highlightColor = '#FCD34D';

  return (
    <g>
      {/* Headband */}
      <ellipse
        cx="100"
        cy="35"
        rx="42"
        ry="6"
        fill={color}
        stroke={accentColor}
        strokeWidth="2"
      />
      <ellipse cx="100" cy="35" rx="42" ry="3" fill={highlightColor} />
    </g>
  );
}
