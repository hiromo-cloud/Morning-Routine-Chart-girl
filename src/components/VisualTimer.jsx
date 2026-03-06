import React from 'react';

export const VisualCircleTimer = ({ secondsLeft, totalSeconds, size = 80 }) => {
  const radius = size / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  const percentage = totalSeconds > 0 ? (secondsLeft / totalSeconds) : 0;
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="white" stroke="#f0fdfa" strokeWidth="4" />
        <circle
          cx={size / 2} cy={size / 2} r={radius / 2}
          fill="transparent" stroke="#7fffd4" strokeWidth={radius}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 border-4 border-white/40 rounded-full shadow-inner pointer-events-none" />
    </div>
  );
};
