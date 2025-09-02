import { useState, useRef } from "react";
import { Flex, TextInput, Button } from "@gravity-ui/uikit";
import block from "bem-cn-lite";
import './ChartWrapper.scss';
import { ChartType } from "@shared/types/charts";
import { BarChart } from "../BarChart";
import { LineChart } from "../LineChart";

const b = block("chart-wrapper");

interface ChartWrapperProps {
    type: ChartType;
    data: { id: string; data: { x: string; y: number }[] }[];
}

export const ChartWrapper = ({ type, data }: ChartWrapperProps) => {
    const [xMin, setXMin] = useState<"auto" | number>("auto");
    const [xMax, setXMax] = useState<"auto" | number>("auto");
    const [yMin, setYMin] = useState<"auto" | number>("auto");
    const [yMax, setYMax] = useState<"auto" | number>("auto");
    const [confidenceLayer, setConfidenceLayer] = useState<"auto" | number>("auto");

    const containerRef = useRef<HTMLDivElement>(null);
    const [panning, setPanning] = useState(false);
    const panStart = useRef<{ x: number; y: number } | null>(null);

    const handleWheel = (e: React.WheelEvent) => {
        if (!e.ctrlKey) return;
        e.preventDefault();

        const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;

        if (typeof yMin === "number" && typeof yMax === "number") {
            const center = (yMin + yMax) / 2;
            const range = (yMax - yMin) * zoomFactor;
            setYMin(center - range / 2);
            setYMax(center + range / 2);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!panning || !panStart.current || !containerRef.current) return;

        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;

        if (typeof xMin === "number" && typeof xMax === "number") {
            const shift = (xMax - xMin) * (dx / containerRef.current.offsetWidth);
            setXMin(xMin - shift);
            setXMax(xMax - shift);
        }

        if (typeof yMin === "number" && typeof yMax === "number") {
            const shift = (yMax - yMin) * (dy / containerRef.current.offsetHeight);
            setYMin(yMin + shift);
            setYMax(yMax + shift);
        }

        panStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        setPanning(false);
        panStart.current = null;
    };

    const resetScales = () => {
        setXMin("auto");
        setXMax("auto");
        setYMin("auto");
        setYMax("auto");
        setConfidenceLayer('auto');
    };

    const handleDoubleClick = () => resetScales();

    const parseNumber = (val: string): number | "auto" => {
        if (val.trim() === "") return "auto";
        const num = Number(val);
        return isNaN(num) ? "auto" : num;
    };

    return (
        <Flex className={b()} direction={"row"}>
            <Flex className={b("controls")} gap={2} justifyContent="flex-start" alignItems="flex-start" direction="column">
                {type === 'power' && <TextInput
                    size="s"
                    type="number"
                    value={confidenceLayer === "auto" ? "" : String(confidenceLayer)}
                    placeholder="confidenceLayer"
                    onChange={(v) => setConfidenceLayer(parseNumber(v.target.value))}
                />}
                <TextInput
                    size="s"
                    type="number"
                    value={yMin === "auto" ? "" : String(yMin)}
                    placeholder="yMin"
                    onChange={(v) => setYMin(parseNumber(v.target.value))}
                />
                <TextInput
                    size="s"
                    type="number"
                    value={yMax === "auto" ? "" : String(yMax)}
                    placeholder="yMax"
                    onChange={(v) => setYMax(parseNumber(v.target.value))}
                />
                <Button size="s" view="outlined" onClick={resetScales}>
                    Сбросить
                </Button>
            </Flex>
            <div
                ref={containerRef}
                className={b("chart", { panning })}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleDoubleClick}
            >
                {
                    type === "acqusition" ? (
                        <BarChart data={data} yScale={{ type: "linear", min: yMin, max: yMax }} />
                    ) : (
                        <LineChart data={data} yScale={{ type: "linear", min: yMin, max: yMax }} confidenceIntervalLayer={confidenceLayer === 'auto' ? undefined : confidenceLayer} />
                    )
                }
            </div>
        </Flex>
    );
};
