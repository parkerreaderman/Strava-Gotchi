interface BeanieProps {
  color?: string;
}

export default function Beanie({ color = '#7C3AED' }: BeanieProps) {
  const accentColor = '#6D28D9';

  return (
    <g>
      {/* Beanie */}
      <ellipse cx="100" cy="18" rx="38" ry="15" fill={color} />
      <path d="M 62 18 Q 62 5 100 5 Q 138 5 138 18" fill={color} />
      {/* Fold */}
      <ellipse cx="100" cy="22" rx="38" ry="4" fill={accentColor} />
    </g>
  );
}
