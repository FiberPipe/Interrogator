import { ChartType } from "@shared/types/charts";

type ChartView = 'chart' | 'table';

export const VIEW_RULES: Record<ChartType, ChartView[]> = {
    'acqusition': ['chart'],
    'fbg': ['table'],
    'wavelength': ['chart', 'table'],
    'displacement': ['chart', 'table'],
    'temperature': ['table'],
    'power': ['chart']
}; 