interface TShirtProps {
  color?: string;
}

export default function TShirt({ color = '#2563EB' }: TShirtProps) {
  return (
    <g>
      {/* T-shirt with sleeves */}
      <rect x="65" y="95" width="70" height="55" rx="8" fill={color} />
      <ellipse cx="100" cy="95" rx="20" ry="8" fill={color} />
      {/* Sleeves */}
      <ellipse cx="52" cy="110" rx="12" ry="20" fill={color} />
      <ellipse cx="148" cy="110" rx="12" ry="20" fill={color} />
    </g>
  );
}
