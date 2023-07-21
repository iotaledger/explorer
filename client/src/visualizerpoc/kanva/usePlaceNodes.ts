import { useRef, useEffect, useCallback } from "react";
import { generateCoordinateGrid } from "../common/heplers";

export const useYCoordinateGenerator = (
    start = -800,
    end = 800,
    limit = 10
) => {
    const positionsRef = useRef<number[]>(
        generateCoordinateGrid(start, end, limit)
    );

    console.log("--- positionsRef", positionsRef);
    const usedPositionsRef = useRef(new Set());
    const step = useRef((end - start) / (limit - 1));

    useEffect(() => {
        positionsRef.current = Array.from(
            { length: limit },
            (_, i) => start + i * step.current
        );
    }, [start, end, limit]);

    const generateY = useCallback(() => {
        if (positionsRef.current.length === 0) {
            const newStart = start - step.current * limit;
            const newEnd = end + step.current * limit;
            positionsRef.current = Array.from(
                { length: limit },
                (_, i) => newStart + i * step.current
            ).concat(
                Array.from({ length: limit }, (_, i) => end + i * step.current)
            );
        }

        const randomIndex = Math.floor(
            Math.random() * positionsRef.current.length
        );
        const y = positionsRef.current.splice(randomIndex, 1)[0];

        usedPositionsRef.current.add(y);

        if (usedPositionsRef.current.size > limit) {
            usedPositionsRef.current.delete(
                usedPositionsRef.current.values().next().value
            );
        }

        return y;
    }, [start, end, limit]);

    const resetY = useCallback(() => {
        positionsRef.current = Array.from(
            { length: limit },
            (_, i) => start + i * step.current
        );
        usedPositionsRef.current.clear();
    }, [start, end, limit]);

    return { generateY, resetY };
};
