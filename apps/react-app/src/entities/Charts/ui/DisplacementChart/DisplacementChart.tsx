import React, { useMemo, useState } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Switch,
    Chip,
    Divider,
    Spacer,
    Code,
} from '@heroui/react';

// Константы по умолчанию
const DEFAULT_LAMBDA_0 = 1550.0; // нм
const DEFAULT_L_MM = 100.0; // мм

type ChartPoint = {
    name: string | number;
    [key: string]: number | string | null | undefined;
};

type CustomTooltipProps = {
    active?: boolean;
    payload?: any[];
    label?: string | number;
    showDisplacement: boolean;
};

const calculateDisplacement = (measuredLambda: number, lambda0: number, Lmm: number): number => {
    if (!Number.isFinite(measuredLambda) || measuredLambda <= 0) return 0;
    const deltaLambda = measuredLambda - lambda0;
    return (Lmm * deltaLambda) / lambda0;
};

const convertDataToDisplacement = (data: ChartPoint[], lambda0: number, Lmm: number): ChartPoint[] => {
    if (!data?.length) return [];
    return data.map((entry) => {
        const next: ChartPoint = { name: entry.name };
        Object.keys(entry).forEach((key) => {
            if (key === 'name') return;
            const num = Number(entry[key]);
            next[key] = Number.isFinite(num) ? calculateDisplacement(num, lambda0, Lmm) : entry[key];
        });
        return next;
    });
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, showDisplacement }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div
            style={{
                backgroundColor: 'white',
                padding: 10,
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                minWidth: 220,
            }}
        >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Время: {label}</div>
            {payload.map((item: any, i: number) => (
                <div key={i} style={{ color: item.color, margin: '4px 0' }}>
                    <span style={{ fontWeight: 600 }}>{item.name || item.dataKey}: </span>
                    <span>
                        {typeof item.value === 'number' ? item.value.toFixed(4) : item.value}
                        {showDisplacement ? ' мм' : ' нм'}
                    </span>
                </div>
            ))}
        </div>
    );
};

type Props = {
    data: ChartPoint[];
    lambda0?: number;
    fiberLengthMm?: number;
    title?: string;
};

export const DisplacementChart: React.FC<Props> = ({
    data,
    lambda0 = DEFAULT_LAMBDA_0,
    fiberLengthMm = DEFAULT_L_MM,
    title = 'Спектральные данные и смещение',
}) => {
    const [showDisplacement, setShowDisplacement] = useState(false);

    const numericKeys = useMemo(() => {
        const set = new Set<string>();
        data?.forEach((row) => {
            Object.keys(row).forEach((k) => {
                if (k !== 'name' && Number.isFinite(Number(row[k]))) set.add(k);
            });
        });
        return Array.from(set);
    }, [data]);

    const displayData = useMemo(() => {
        if (!data?.length) return [];
        return showDisplacement ? convertDataToDisplacement(data, lambda0, fiberLengthMm) : data;
    }, [data, showDisplacement, lambda0, fiberLengthMm]);

    return (
        <div className="w-full h-[70vh]">
                    <ChartWrapper>
                        <LineChart data={chartData} />
                    </ChartWrapper>
                </div>
        <Card className="w-full h-full">
            <CardHeader className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                    <span className="text-lg font-semibold">{title}</span>
                    <span className="text-default-500 text-sm">
                        Переключайтесь между длиной волны и рассчитанным смещением
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className={showDisplacement ? 'text-default-500' : 'font-semibold'}>Длина волны (нм)</span>
                    <Switch
                        size="sm"
                        isSelected={showDisplacement}
                        onValueChange={setShowDisplacement}
                        aria-label="Переключить режим отображения"
                    />
                    <span className={showDisplacement ? 'font-semibold' : 'text-default-500'}>Смещение (мм)</span>
                </div>
            </CardHeader>

            <Divider />

            <CardBody className="gap-3">
                <div className={`flex flex-wrap items-center gap-2 ${showDisplacement ? '' : ''}`}>
                    <Chip variant="flat" color="primary" size="sm">
                        λ₀: {lambda0} нм
                    </Chip>
                    <Chip variant="flat" color="secondary" size="sm">
                        L: {fiberLengthMm} мм
                    </Chip>
                    {showDisplacement && (
                        <Chip variant="bordered" color="success" size="sm">
                            Формула: Смещение = L × (λ − λ₀) / λ₀
                        </Chip>
                    )}
                </div>

                <Spacer y={1} />
            </CardBody>

            <Divider />

            <CardFooter className="text-sm text-default-600 flex flex-col gap-1">
                <div>
                    Формула расчета: <Code>Смещение = L × (λ − λ₀) / λ₀</Code>
                </div>
                <div>где L — длина волокна, λ — измеренная длина волны, λ₀ — эталонная длина волны.</div>
                <div>Переключатель сверху меняет режим отображения между исходной длиной волны и смещением.</div>
            </CardFooter>
        </Card>
    );
};
