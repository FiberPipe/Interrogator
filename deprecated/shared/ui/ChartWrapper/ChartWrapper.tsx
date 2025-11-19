"use client";

import {
    useRef,
    useMemo,
    ReactElement,
    cloneElement,
    isValidElement,
} from "react";

export type AutoOrNum = "auto" | number;

export interface ChartWrapperControls {
    autoY: boolean;
    yMin: AutoOrNum;
    yMax: AutoOrNum;
    setYMin: (v: AutoOrNum) => void;
    setYMax: (v: AutoOrNum) => void;
    confidenceLayer: AutoOrNum;
    onReset?: () => void;
}

interface ChartWrapperProps extends ChartWrapperControls {
    children: ReactElement<any>;
}

export const ChartWrapper = ({
    children,
    autoY,
    yMin,
    yMax,
    setYMin,
    setYMax,
    confidenceLayer,
    onReset,
}: ChartWrapperProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const panningRef = useRef(false);
    const panStart = useRef<{ x: number; y: number } | null>(null);

    const yScale = useMemo(
        () => ({
            type: "linear",
            min: yMin === "auto" ? "auto" : yMin,
            max: yMax === "auto" ? "auto" : yMax,
        }),
        [yMin, yMax]
    );

    const ciValue = useMemo(
        () => (confidenceLayer === "auto" ? 0 : Number(confidenceLayer) || 0),
        [confidenceLayer]
    );

    const handleWheel = (e: React.WheelEvent) => {
        if (!e.ctrlKey || autoY) return;
        e.preventDefault();
        if (typeof yMin !== "number" || typeof yMax !== "number") return;
        const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
        const center = (yMin + yMax) / 2;
        const range = (yMax - yMin) * zoomFactor;
        setYMin(center - range / 2);
        setYMax(center + range / 2);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (autoY) return;
        panningRef.current = true;
        panStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (autoY || !panningRef.current || !panStart.current || !containerRef.current) return;

        const dy = e.clientY - panStart.current.y;

        if (typeof yMin === "number" && typeof yMax === "number") {
            const shiftY = (yMax - yMin) * (dy / containerRef.current.offsetHeight);
            setYMin(yMin + shiftY);
            setYMax(yMax + shiftY);
        }

        panStart.current = { x: e.clientX, y: e.clientY };
    };

    const endPan = () => {
        panningRef.current = false;
        panStart.current = null;
    };

    const handleDoubleClick = () => onReset?.();

    const child = isValidElement(children)
        ? cloneElement(children, {
            yScale,
            confidenceIntervalLayer: ciValue,
        })
        : children;

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full ${autoY ? "cursor-default" : "cursor-grab"}`}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={endPan}
            onMouseLeave={endPan}
            onDoubleClick={handleDoubleClick}
        >
            <div className="absolute inset-0">{child}</div>
        </div>
    );
};
