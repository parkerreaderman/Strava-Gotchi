interface TankTopProps {
  color?: string;
}

export default function TankTop({ color = '#DC2626' }: TankTopProps) {
  return (
    <g>
      {/* Tank top */}
      <rect x="70" y="95" width="60" height="50" rx="8" fill={color} />
      <ellipse cx="100" cy="95" rx="15" ry="8" fill={color} />
    </g>
  );
}
