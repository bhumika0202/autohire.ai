import { useEffect, useState } from 'react';
import './MatchScore.css';

const getCategory = (score) => {
  if (score >= 90) return { label: 'Excellent Match', color: '#22C55E' };
  if (score >= 75) return { label: 'Strong Match', color: '#3B82F6' };
  if (score >= 60) return { label: 'Moderate Match', color: '#F97316' };
  return { label: 'Low Match', color: '#94A3B8' };
};

export default function MatchScore({ score = 0, size = 'md' }) {
  const [animated, setAnimated] = useState(0);
  const { label, color } = getCategory(score);

  const sizes = {
    sm: { dim: 72, stroke: 6, fontSize: 14 },
    md: { dim: 96, stroke: 7, fontSize: 18 },
    lg: { dim: 120, stroke: 8, fontSize: 22 },
  };

  const { dim, stroke, fontSize } = sizes[size] || sizes.md;
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="match-score" style={{ '--score-color': color }}>
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {/* Track */}
        <circle
          cx={dim / 2} cy={dim / 2} r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={dim / 2} cy={dim / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        {/* Text */}
        <text
          x="50%" y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill={color}
          fontSize={fontSize}
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          {animated}%
        </text>
      </svg>
      <span className="match-score-label" style={{ color, fontSize: size === 'sm' ? 11 : 12 }}>
        {label}
      </span>
    </div>
  );
}
