interface TrailShoesProps {
  color?: string;
}

export default function TrailShoes({ color = '#78350F' }: TrailShoesProps) {
  const accentColor = '#451A03';

  return (
    <g>
      {/* Trail shoes - rugged design */}
      <ellipse
        cx="75"
        cy="195"
        rx="24"
        ry="13"
        fill={color}
        stroke={accentColor}
        strokeWidth="2"
      />
      <ellipse
        cx="125"
        cy="195"
        rx="24"
        ry="13"
        fill={color}
        stroke={accentColor}
        strokeWidth="2"
      />
      {/* Tread marks */}
      <line
        x1="65"
        y1="197"
        x2="85"
        y2="197"
        stroke={accentColor}
        strokeWidth="1.5"
      />
      <line
        x1="115"
        y1="197"
        x2="135"
        y2="197"
        stroke={accentColor}
        strokeWidth="1.5"
      />
    </g>
  );
}
