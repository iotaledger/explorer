import { useEffect, useState } from "react";
import { useNovaTimeConvert } from "./useNovaTimeConvert";

export function useCurrentEpochProgress(): { currentEpochIndex: number | null; currentEpochProgress: number | null } {
    const { unixTimestampToEpochIndex, epochIndexToUnixTimeRange } = useNovaTimeConvert();
    const [intervalTimerHandle, setIntervalTimerHandle] = useState<NodeJS.Timeout | null>(null);
    const [currentEpochIndex, setCurrentEpochIndex] = useState<number | null>(null);
    const [currentEpochProgress, setCurrentEpochProgress] = useState<number | null>(null);

    useEffect(() => {
        if (intervalTimerHandle === null) {
            checkCurrentEpochIndex();

            const intervalTimerHandle = setInterval(() => {
                checkCurrentEpochIndex();
            }, 1000);

            setIntervalTimerHandle(intervalTimerHandle);
        }

        return () => {
            if (intervalTimerHandle) {
                clearInterval(intervalTimerHandle);
            }
            setIntervalTimerHandle(null);
            setCurrentEpochIndex(null);
        };
    }, []);

    const checkCurrentEpochIndex = () => {
        if (unixTimestampToEpochIndex && epochIndexToUnixTimeRange) {
            const now = Math.floor(Date.now() / 1000);
            const currentEpochIndex = unixTimestampToEpochIndex(now);

            const epochTimeRange = epochIndexToUnixTimeRange(currentEpochIndex);

            const epochProgressPercent = Math.trunc(((now - epochTimeRange.from) / (epochTimeRange.to - 1 - epochTimeRange.from)) * 100);

            setCurrentEpochIndex(currentEpochIndex);
            setCurrentEpochProgress(epochProgressPercent);
        }
    };

    return { currentEpochIndex, currentEpochProgress };
}
