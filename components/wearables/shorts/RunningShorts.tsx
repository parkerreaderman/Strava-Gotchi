interface RunningShortsProps {
  color?: string;
}

export default function RunningShorts({ color = '#1E40AF' }: RunningShortsProps) {
  const accentColor = '#1E3A8A';

  return (
    <g>
      {/* Running shorts - simple shorts design */}
      <rect x="65" y="140" width="70" height="25" rx="5" fill={color} />
      <line
        x1="100"
        y1="140"
        x2="100"
        y2="165"
        stroke={accentColor}
        strokeWidth="2"
      />
    </g>
  );
}
