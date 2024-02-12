import { useNetworkInfoNova } from "../networkInfo";
import {
    slotIndexToEpochIndexConverter,
    slotIndexToUnixTimeRangeConverter,
    unixTimestampToEpochIndexConverter,
    unixTimestampToSlotIndexConverter,
} from "../novaTimeUtils";

export function useNovaTimeConvert(): {
    unixTimestampToSlotIndex: ((unixTimestampSeconds: number) => number) | null;
    slotIndexToTimeRange: ((slotIndex: number) => { from: number; to: number }) | null;
    slotIndexToEpochIndex: ((targetSlotIndex: number) => number) | null;
    unixTimestampToEpochIndex: ((unixTimestampSeconds: number) => number) | null;
} {
    const { protocolInfo } = useNetworkInfoNova((s) => s.networkInfo);

    return {
        unixTimestampToSlotIndex: protocolInfo ? unixTimestampToSlotIndexConverter(protocolInfo) : null,
        slotIndexToTimeRange: protocolInfo ? slotIndexToUnixTimeRangeConverter(protocolInfo) : null,
        slotIndexToEpochIndex: protocolInfo ? slotIndexToEpochIndexConverter(protocolInfo) : null,
        unixTimestampToEpochIndex: protocolInfo ? unixTimestampToEpochIndexConverter(protocolInfo) : null,
    };
}
