import moment from "moment";
import { useEffect, useState } from "react";
import { useNovaTimeConvert } from "./useNovaTimeConvert";

export function useCurrentEpochProgress(): {
    epochIndex: number | null;
    epochUnixTimeRange: { from: number; to: number } | null;
    epochProgressPercent: number | null;
    registrationTime: number | null;
} {
    const { slotIndexToUnixTimeRange, unixTimestampToEpochIndex, epochIndexToUnixTimeRange, getRegistrationSlotFromEpochIndex } =
        useNovaTimeConvert();
    const [intervalTimerHandle, setIntervalTimerHandle] = useState<NodeJS.Timeout | null>(null);
    const [epochIndex, setEpochIndex] = useState<number | null>(null);
    const [epochProgressPercent, setEpochProgressPercent] = useState<number | null>(null);
    const [registrationTime, setRegistrationTime] = useState<number | null>(null);
    const [epochUnixTimeRange, setEpochUnixTimeRange] = useState<{ from: number; to: number } | null>(null);

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
            setEpochIndex(null);
        };
    }, []);

    const checkCurrentEpochIndex = () => {
        if (unixTimestampToEpochIndex && epochIndexToUnixTimeRange) {
            const now = moment().unix();
            const currentEpochIndex = unixTimestampToEpochIndex(now);

            const epochTimeRange = epochIndexToUnixTimeRange(currentEpochIndex);

            const epochProgressPercent = Math.trunc(((now - epochTimeRange.from) / (epochTimeRange.to - 1 - epochTimeRange.from)) * 100);

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
