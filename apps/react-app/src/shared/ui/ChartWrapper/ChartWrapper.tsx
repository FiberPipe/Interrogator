"use client";

import { useState, useRef, ReactNode } from "react";
import { ChartControls } from "./ChartsControl";

interface ChartWrapperProps {
    children: ReactNode;
}

export const ChartWrapper = ({ children }: ChartWrapperProps) => {
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
        setConfidenceLayer("auto");
    };

    const handleDoubleClick = () => resetScales();

    return (
        <div className="flex w-full h-full">
            <ChartControls
                yMin={yMin}
                yMax={yMax}
                setYMin={setYMin}
                setYMax={setYMax}
                resetScales={resetScales}
            />

            <div
                ref={containerRef}
                className={`flex-1 h-full w-full relative overflow-hidden ${panning ? "cursor-grabbing" : "cursor-default"
                    }`}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleDoubleClick}
            >
                {children}
            </div>
        </div>
    );
};
