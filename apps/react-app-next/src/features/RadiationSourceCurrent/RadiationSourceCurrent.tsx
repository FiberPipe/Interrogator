import { Slider } from "@gravity-ui/uikit"
import { useState } from "react";
import { Label } from "recharts"

export const RadiationSourceCurrentManager = () => {
    const [laserCurrent, setLaserCurrent] = useState(0);
    return (
        <div className="mb-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <Label >Ток источника излучения (КИИ)</Label>
                <div className="g-rounded" style={{ padding: '4px 8px', backgroundColor: 'var(--g-color-base-brand-light)', color: 'var(--g-color-base-brand)' }}>
                    {laserCurrent} мА
                </div>
            </div>
            <Slider
                id="laser-current"
                min={0}
                max={3000}
                step={10}
                value={laserCurrent}
                onUpdate={(value) => setLaserCurrent(value)}
                disabled={false}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--g-color-text-secondary)' }}>
                <span>0 мА</span>
                <span>3000 мА</span>
            </div>
        </div>
    )
}