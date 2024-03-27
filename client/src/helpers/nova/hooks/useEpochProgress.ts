import moment from "moment";
import { useEffect, useState } from "react";
import { useNovaTimeConvert } from "./useNovaTimeConvert";
import { NumberHelper } from "~helpers/numberHelper";

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

    const determineCurrentEpochIndex = (providedIndex: number | undefined, currentTime: number): number => {
        if (providedIndex !== undefined && NumberHelper.isNumber(providedIndex)) {
            return providedIndex;
        } else if (unixTimestampToEpochIndex) {
            const epochIndex = unixTimestampToEpochIndex(currentTime);
            if (!NumberHelper.isNumber(epochIndex)) {
                throw new Error("Failed to convert timestamp to a valid epoch index.");
            }
            return epochIndex;
        } else {
            throw new Error("unixTimestampToEpochIndex function is unavailable.");
        }
    };

    const checkEpochIndex = () => {
        if (unixTimestampToEpochIndex && epochIndexToUnixTimeRange) {
            const now = moment().unix();
            const currentEpochIndex = determineCurrentEpochIndex(index, now);

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
