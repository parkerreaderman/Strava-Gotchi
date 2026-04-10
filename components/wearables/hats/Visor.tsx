interface VisorProps {
  color?: string;
}

export default function Visor({ color = '#DC2626' }: VisorProps) {
  const accentColor = '#991B1B';

  return (
    <g>
      {/* Visor */}
      <path
        d="M 65 25 Q 65 20 100 20 Q 135 20 135 25"
        fill={color}
        stroke={accentColor}
        strokeWidth="2"
      />
      {/* Brim */}
      <ellipse
        cx="115"
        cy="28"
        rx="22"
        ry="7"
        fill={color}
        stroke={accentColor}
        strokeWidth="1.5"
      />
    </g>
  );
}
