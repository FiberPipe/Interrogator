import { useState, useCallback } from "react";

interface UseZoomProps {
  series: { data: { y: number }[] }[];
  initialMin?: number;
  initialMax?: number;
  factor?: number;
}

export const useZoom = ({ series, initialMin, initialMax, factor = 0.05 }: UseZoomProps) => {
  const globalMin = Math.min(...series.flatMap(s => s.data.map(d => d.y)));
  const globalMax = Math.max(...series.flatMap(s => s.data.map(d => d.y)));

  const [yMin, setYMin] = useState<number | undefined>(initialMin);
  const [yMax, setYMax] = useState<number | undefined>(initialMax);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const min = yMin ?? globalMin;
      const max = yMax ?? globalMax;
      const delta = (max - min) * factor * (e.deltaY > 0 ? 1 : -1);
      setYMin(min + delta);
      setYMax(max - delta);
    },
    [yMin, yMax, factor, globalMin, globalMax]
  );

  return { yMin, yMax, setYMin, setYMax, handleWheel };
};
