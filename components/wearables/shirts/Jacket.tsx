interface JacketProps {
  color?: string;
}

export default function Jacket({ color = '#059669' }: JacketProps) {
  return (
    <g>
      {/* Jacket */}
      <rect x="62" y="92" width="76" height="58" rx="10" fill={color} />
      <ellipse cx="100" cy="92" rx="22" ry="9" fill={color} />
      {/* Sleeves */}
      <ellipse cx="48" cy="110" rx="14" ry="25" fill={color} />
      <ellipse cx="152" cy="110" rx="14" ry="25" fill={color} />
      {/* Zipper */}
      <line
        x1="100"
        y1="95"
        x2="100"
        y2="150"
        stroke="#374151"
        strokeWidth="3"
      />
    </g>
  );
}
