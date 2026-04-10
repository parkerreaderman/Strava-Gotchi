'use client';

interface MetricCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

const colorClasses: Record<string, string> = {
  blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/50',
  orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/50',
  green: 'from-green-500/20 to-green-600/20 border-green-500/50',
  red: 'from-red-500/20 to-red-600/20 border-red-500/50',
  purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/50',
};

const textColors: Record<string, string> = {
  blue: 'text-blue-400',
  orange: 'text-orange-400',
  green: 'text-green-400',
  red: 'text-red-400',
  purple: 'text-purple-400',
};

export default function MetricCard({ label, value, icon, color }: MetricCardProps) {
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color] || colorClasses.blue} border rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'monospace' }}>
          {label}
        </span>
      </div>
      <div className={`text-2xl font-bold ${textColors[color] || textColors.blue}`} style={{ fontFamily: 'monospace' }}>
        {Math.round(value)}
      </div>
    </div>
  );
}
