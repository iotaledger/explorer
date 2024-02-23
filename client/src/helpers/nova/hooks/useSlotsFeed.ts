import moment from "moment";
import { useEffect, useState } from "react";
import { useNovaTimeConvert } from "./useNovaTimeConvert";

const DEFAULT_SLOT_LIMIT = 10;

export default function useSlotsFeed(slotsLimit: number = DEFAULT_SLOT_LIMIT): {
    currentSlot: number | null;
    currentSlotProgressPercent: number | null;
    latestSlots: number[] | null;
} {
    const { unixTimestampToSlotIndex, slotIndexToUnixTimeRange } = useNovaTimeConvert();
    const [currentSlot, setCurrentSlot] = useState<number | null>(null);
    const [latestSlots, setLatestSlots] = useState<number[] | null>(null);
    const [currentSlotProgressPercent, setCurrentSlotProgressPercent] = useState<number | null>(null);
    const [slotTimeUpdateHandle, setSlotTimeUpdateHandle] = useState<NodeJS.Timeout | null>(null);

    const checkCurrentSlot = () => {
        if (unixTimestampToSlotIndex && slotIndexToUnixTimeRange) {
            const now = moment().unix();
            const currentSlotIndex = unixTimestampToSlotIndex(now);
            const slotTimeRange = slotIndexToUnixTimeRange(currentSlotIndex);

            const slotProgressPercent = Math.trunc(((now - slotTimeRange.from) / (slotTimeRange.to - 1 - slotTimeRange.from)) * 100);
            setCurrentSlot(currentSlotIndex);
            setCurrentSlotProgressPercent(slotProgressPercent);
            setLatestSlots(Array.from({ length: slotsLimit - 1 }, (_, i) => currentSlotIndex - 1 - i));
        }
    };

    useEffect(() => {
        if (slotTimeUpdateHandle === null) {
            checkCurrentSlot();
            const intervalTimerHandle = setInterval(() => {
                checkCurrentSlot();
            }, 950);

            setSlotTimeUpdateHandle(intervalTimerHandle);
        }

        return () => {
            if (slotTimeUpdateHandle) {
                clearInterval(slotTimeUpdateHandle);
            }
            setSlotTimeUpdateHandle(null);
            setCurrentSlot(null);
            setCurrentSlotProgressPercent(null);
            setLatestSlots(null);
        };
    }, []);

    return { currentSlot, currentSlotProgressPercent, latestSlots };
}
