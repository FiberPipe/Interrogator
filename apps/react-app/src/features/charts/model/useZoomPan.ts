import { useState, useCallback } from "react";

export function useZoomPan() {
    const [scale, setScale] = useState<{ min: number | "auto"; max: number | "auto" }>({
        min: "auto",
        max: "auto",
    });

    const handleWheel = useCallback(
        (e: React.WheelEvent) => {
            if (typeof scale.min !== "number" || typeof scale.max !== "number") return;
            const delta = e.deltaY > 0 ? 1.1 : 0.9;
            const mid = (scale.min + scale.max) / 2;
            const newRange = (scale.max - scale.min) * delta;
            setScale({
                min: mid - newRange / 2,
                max: mid + newRange / 2,
            });
        },
        [scale]
    );

    return { scale, setScale, handleWheel };
}
