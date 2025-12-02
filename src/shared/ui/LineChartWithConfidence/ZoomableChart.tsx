import React from 'react';
import { useZoom } from './useZoom';

interface ZoomableChartProps {
  children: React.ReactNode;
  series: { data: { y: number }[] }[];
  initialMin?: number;
  initialMax?: number;
}

export const ZoomableChart: React.FC<ZoomableChartProps> = ({
  children,
  series,
  initialMin,
  initialMax,
}) => {
  const { handleWheel } = useZoom({ series, initialMin, initialMax });

  return (
    <div style={{ height: '100%' }} onWheel={handleWheel}>
      {children}
    </div>
  );
};
