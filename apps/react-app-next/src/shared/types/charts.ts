export type ChartType = 'acqusition' | 'power' | 'displacement' | 'temperature' | 'wavelength' | 'fbg';
export type ChartData = { id: string; data: { x: string; y: number; }[]; };

export type ChartInputData = {
    data: ChartData[];
    unit: ChartType;
}