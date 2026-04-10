interface BaseballCapProps {
  color?: string;
}

export default function BaseballCap({ color = '#1E40AF' }: BaseballCapProps) {
  const accentColor = '#1E3A8A';

  return (
    <g>
      {/* Baseball cap */}
      <ellipse cx="100" cy="20" rx="35" ry="12" fill={color} />
      <path d="M 65 20 Q 65 10 100 10 Q 135 10 135 20" fill={color} />
      {/* Brim */}
      <ellipse cx="120" cy="25" rx="25" ry="8" fill={accentColor} />
    </g>
  );
}
