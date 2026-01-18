export interface ChartDataPoint {
  x: number;
  y: number;
  yMin?: number;
  yMax?: number;
}

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  data: ChartDataPoint[];
  showConfidence?: boolean;
}

export type ViewType = 'chart' | 'table' | 'dashboard';
export type MetricType = 'power' | 'pressure' | 'temperature' | 'wavelength';
