import moment from "moment";
import { useEffect, useState } from "react";
import { useNovaTimeConvert } from "./useNovaTimeConvert";

/**
 * Returns the epoch progress information for the provided index or the current epoch if no index is provided.
 * @param index - The index of the epoch. If not provided, the current epoch will be used.
 * @returns An object containing the epoch progress information.
 */
export function useEpochProgress(index?: number): {
    epochIndex: number | null;
    epochUnixTimeRange: { from: number; to: number } | null;
    epochProgressPercent: number | null;
    registrationTime: number | null;
} {
    const { slotIndexToUnixTimeRange, unixTimestampToEpochIndex, epochIndexToUnixTimeRange, getRegistrationSlotFromEpochIndex } =
        useNovaTimeConvert();
    const [epochIndex, setEpochIndex] = useState<number | null>(null);
    const [epochProgressPercent, setEpochProgressPercent] = useState<number | null>(null);
    const [registrationTime, setRegistrationTime] = useState<number | null>(null);
    const [epochUnixTimeRange, setEpochUnixTimeRange] = useState<{ from: number; to: number } | null>(null);

    useEffect(() => {
        checkEpochIndex();

        const intervalTimerHandle = setInterval(() => {
            checkEpochIndex();
        }, 1000);

        return () => {
            if (intervalTimerHandle) {
                clearInterval(intervalTimerHandle);
            }
            setEpochIndex(null);
        };
    }, [index]);

    const checkEpochIndex = () => {
        if (unixTimestampToEpochIndex && epochIndexToUnixTimeRange) {
            const now = moment().unix();
            let currentEpochIndex = index ?? null;
            if (!currentEpochIndex) {
                currentEpochIndex = unixTimestampToEpochIndex(now);
            }

            const epochTimeRange = epochIndexToUnixTimeRange(currentEpochIndex);

            const epochProgressPercent =
                epochTimeRange.to < now
                    ? 100
                    : Math.trunc(((now - epochTimeRange.from) / (epochTimeRange.to - 1 - epochTimeRange.from)) * 100);

            setEpochIndex(currentEpochIndex);
            setEpochUnixTimeRange(epochTimeRange);
            setEpochProgressPercent(epochProgressPercent);
        }
    };

    useEffect(() => {
        if (getRegistrationSlotFromEpochIndex && slotIndexToUnixTimeRange && epochIndex !== null) {
            const slotIndex = getRegistrationSlotFromEpochIndex(epochIndex);
            const slotTimeRange = slotIndexToUnixTimeRange(slotIndex);
            setRegistrationTime(slotTimeRange.to - 1);
        }
    }, [epochIndex]);

    return { epochIndex, epochUnixTimeRange, epochProgressPercent, registrationTime };
}
