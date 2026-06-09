interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  gradient?: string;
}

const ProgressRing = ({
  value,
  max,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  gradient = 'from-primary-400 to-primary-600',
}: ProgressRingProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const gradientId = `ring-gradient-${Math.random().toString(36).substr(2, 9)}`;

  const getGradientColors = () => {
    if (gradient.includes('primary')) return ['#34D399', '#10B981'];
    if (gradient.includes('accent')) return ['#FB923C', '#F97316'];
    return ['#34D399', '#10B981'];
  };

  const [color1, color2] = getGradientColors();

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color1} />
            <stop offset="100%" stopColor={color2} />
          </linearGradient>
        </defs>
        
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E7E5E4"
          strokeWidth={strokeWidth}
        />
        
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span className="text-2xl font-bold text-warmgray-800">{label}</span>
        )}
        {sublabel && (
          <span className="text-xs text-warmgray-500 mt-0.5">{sublabel}</span>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;
