import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface PowerSparklineProps {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  alarmMin?: number;
  alarmMax?: number;
}

export const PowerSparkline = ({
  values,
  width = 120,
  height = 40,
  color = '#3b82f6',
  alarmMin,
  alarmMax,
}: PowerSparklineProps) => {
  const points = useMemo(() => {
    if (values.length === 0) return '';

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    return values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');
  }, [values, width, height]);

  const alarmZones = useMemo(() => {
    if (!alarmMin && !alarmMax) return null;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const zones = [];

    if (alarmMin !== undefined) {
      const y = height - ((alarmMin - min) / range) * height;
      zones.push(
        <line
          key="alarm-min"
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke="#ef4444"
          strokeWidth={1}
          strokeDasharray="2,2"
          opacity={0.5}
        />
      );
    }

    if (alarmMax !== undefined) {
      const y = height - ((alarmMax - min) / range) * height;
      zones.push(
        <line
          key="alarm-max"
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke="#ef4444"
          strokeWidth={1}
          strokeDasharray="2,2"
          opacity={0.5}
        />
      );
    }

    return zones;
  }, [values, width, height, alarmMin, alarmMax]);

  if (values.length === 0) {
    return (
      <div className="flex items-center justify-center text-xs text-default-400" style={{ width, height }}>
        No data
      </div>
    );
  }

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Background */}
      <rect width={width} height={height} fill="transparent" />

      {/* Alarm zones */}
      {alarmZones}

      {/* Line chart */}
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Last point */}
      {points && (
        <motion.circle
          cx={points.split(' ').pop()?.split(',')[0]}
          cy={points.split(' ').pop()?.split(',')[1]}
          r={3}
          fill={color}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        />
      )}
    </svg>
  );
};
