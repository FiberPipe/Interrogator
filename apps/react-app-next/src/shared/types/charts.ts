export type ChartType = 'Acquisition' | 'Power' | 'Displacement' | 'Temperature';
export type ChartData = {
    time: string;
    value: number;
}

export type ChartInputData = {
    data: ChartData[];
    unit: ChartType;
}