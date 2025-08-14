export type ChartType = 'Acquisition' | 'Power' | 'Displacement' | 'Temperature';
export type ChartData = {
    time: string;
    value: number;
}

export type ChartInputData = {
    data: ChartData[];
    unit: ChartType;
}


export const generateData = (type: ChartType): ChartInputData => {
    const data = [];
    const now = new Date();

    const config = {
        'Acquisition': { unit: 'Hz', baseValue: 2000, fluctuation: 100 },
        'Power': { unit: 'W', baseValue: 500, fluctuation: 50 },
        'Displacement': { unit: 'mm', baseValue: 10, fluctuation: 2 },
        'Temperature': { unit: '°C', baseValue: 85, fluctuation: 5 },
    };

    const { baseValue, fluctuation } = config[type];

    for (let i = 0; i < 10; i++) {
        const time = new Date(now.getTime() - (100 - i) * 60000);
        const value = baseValue + (Math.random() - 0.5) * fluctuation * 2;

        data.push({
            time: time.toISOString(),
            value: value,
        });
    }

    return { data, unit: config[type].unit };
};