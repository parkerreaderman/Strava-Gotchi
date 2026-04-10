interface RunningShoesProps {
  color?: string;
}

export default function RunningShoes({ color = '#DC2626' }: RunningShoesProps) {
  const accentColor = '#991B1B';

  return (
    <g>
      {/* Running shoes - sleek design */}
      <ellipse
        cx="75"
        cy="195"
        rx="24"
        ry="12"
        fill={color}
        stroke={accentColor}
        strokeWidth="2"
      />
      <ellipse
        cx="125"
        cy="195"
        rx="24"
        ry="12"
        fill={color}
        stroke={accentColor}
        strokeWidth="2"
      />
      {/* Swoosh detail */}
      <path
        d="M 60 195 Q 70 192 80 195"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M 110 195 Q 120 192 130 195"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
    </g>
  );
}
