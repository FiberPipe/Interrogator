import { Slider } from "@gravity-ui/uikit"
import { useState } from "react";
import { Text } from "recharts"

export const TermalControllerCurrent = () => {
    const [tecCurrent, setTecCurrent] = useState(0);

    // Расчет температуры на основе тока TEC
    const calculateTargetTemp = (current: number) => {
        // Линейная интерполяция: -4A = 15°C, 0A = 27.5°C, +4A = 40°C
        return 27.5 + (current * 3.125);
    };

    return (
        <div className="mb-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <Text>Ток термоконтроллера (TEC)</Text>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="g-rounded" style={{ padding: '4px 8px', backgroundColor: 'var(--g-color-base-info-light)', color: 'var(--g-color-base-info)' }}>
                        {tecCurrent} мА
                    </div>
                    <div className="g-rounded" style={{ padding: '4px 8px', backgroundColor: 'var(--g-color-base-warning-light)', color: 'var(--g-color-base-warning)' }}>
                        Целевая: {calculateTargetTemp(tecCurrent / 1000).toFixed(1)}°C
                    </div>
                </div>
            </div>
            <Slider
                id="tec-current"
                min={-4000}
                max={4000}
                step={50}
                value={tecCurrent}
                onUpdate={(value) => setTecCurrent(value)}
                disabled={false}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--g-color-text-secondary)' }}>
                <span>-4000 мА (15°C)</span>
                <span>0 мА (27.5°C)</span>
                <span>+4000 мА (40°C)</span>
            </div>
        </div>
    )
}