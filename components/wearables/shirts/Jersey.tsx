interface JerseyProps {
  color?: string;
}

export default function Jersey({ color = '#F97316' }: JerseyProps) {
  return (
    <g>
      {/* Athletic jersey */}
      <rect x="68" y="95" width="64" height="52" rx="8" fill={color} />
      <ellipse cx="100" cy="95" rx="18" ry="8" fill={color} />
      {/* Side stripes */}
      <line x1="75" y1="95" x2="75" y2="147" stroke="white" strokeWidth="3" />
      <line
        x1="125"
        y1="95"
        x2="125"
        y2="147"
        stroke="white"
        strokeWidth="3"
      />
    </g>
  );
}
