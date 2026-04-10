interface TrackSpikesProps {
  color?: string;
}

export default function TrackSpikes({ color = '#FBBF24' }: TrackSpikesProps) {
  const accentColor = '#F59E0B';

  return (
    <g>
      {/* Track spikes - minimal design */}
      <ellipse
        cx="75"
        cy="195"
        rx="23"
        ry="11"
        fill={color}
        stroke={accentColor}
        strokeWidth="2"
      />
      <ellipse
        cx="125"
        cy="195"
        rx="23"
        ry="11"
        fill={color}
        stroke={accentColor}
        strokeWidth="2"
      />
      {/* Spike details */}
      <circle cx="68" cy="198" r="2" fill="#374151" />
      <circle cx="75" cy="199" r="2" fill="#374151" />
      <circle cx="82" cy="198" r="2" fill="#374151" />
      <circle cx="118" cy="198" r="2" fill="#374151" />
      <circle cx="125" cy="199" r="2" fill="#374151" />
      <circle cx="132" cy="198" r="2" fill="#374151" />
    </g>
  );
}
