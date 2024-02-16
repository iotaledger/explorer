import { useNetworkInfoNova } from "../networkInfo";
import {
    slotIndexToEpochIndexConverter,
    slotIndexToUnixTimeRangeConverter,
    unixTimestampToEpochIndexConverter,
    unixTimestampToSlotIndexConverter,
    epochIndexToSlotIndexRangeConverter,
    epochIndexToUnixTimeRangeConverter,
    getRegistrationSlotFromEpochIndex,
} from "../novaTimeUtils";

export function useNovaTimeConvert(): {
    unixTimestampToSlotIndex: ((unixTimestampSeconds: number) => number) | null;
    slotIndexToUnixTimeRange: ((slotIndex: number) => { from: number; to: number }) | null;
    slotIndexToEpochIndex: ((targetSlotIndex: number) => number) | null;
    unixTimestampToEpochIndex: ((unixTimestampSeconds: number) => number) | null;
    epochIndexToSlotIndexRange: ((targetEpochIndex: number) => { from: number; to: number }) | null;
    epochIndexToUnixTimeRange: ((targetEpochIndex: number) => { from: number; to: number }) | null;
    getRegistrationSlotFromEpochIndex: ((targetEpochIndex: number) => number) | null;
} {
    const { protocolInfo } = useNetworkInfoNova((s) => s.networkInfo);

    return {
        unixTimestampToSlotIndex: protocolInfo ? unixTimestampToSlotIndexConverter(protocolInfo) : null,
        slotIndexToUnixTimeRange: protocolInfo ? slotIndexToUnixTimeRangeConverter(protocolInfo) : null,
        slotIndexToEpochIndex: protocolInfo ? slotIndexToEpochIndexConverter(protocolInfo) : null,
        unixTimestampToEpochIndex: protocolInfo ? unixTimestampToEpochIndexConverter(protocolInfo) : null,
        epochIndexToSlotIndexRange: protocolInfo ? epochIndexToSlotIndexRangeConverter(protocolInfo) : null,
        epochIndexToUnixTimeRange: protocolInfo ? epochIndexToUnixTimeRangeConverter(protocolInfo) : null,
        getRegistrationSlotFromEpochIndex: protocolInfo ? getRegistrationSlotFromEpochIndex(protocolInfo) : null,
    };
}
