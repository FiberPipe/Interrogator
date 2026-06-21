export interface ReferenceLine {
  y: number;
  label?: string;
  stroke?: string;
  strokeDasharray?: string;
  strokeWidth?: number;
  opacity?: number;
}

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  data: ChartDataPoint[];
  showConfidence?: boolean;
  strokeWidth?: number;
  strokeDasharray?: string;
}

export interface ChartDataPoint {
  x: number | string;
  y: number;
  yMin?: number;
  yMax?: number;
  timestamp?: string;
  [key: string]: any;
}
