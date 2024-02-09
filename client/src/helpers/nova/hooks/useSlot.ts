import { ProtocolInfo } from "@iota/sdk-wasm-nova/web";
import { slotIndexToUnixTimeRangeConverter, unixTimestampToSlotIndexConverter } from "../novaTimeUtils";

export function useSlotIndex(protocolInfo?: ProtocolInfo): {
    unixTimestampToSlotIndex: ((unixTimestampSeconds: number) => number) | null;
    slotIndexToTimeRange: ((slotIndex: number) => { from: number; to: number }) | null;
} {
    return {
        unixTimestampToSlotIndex: protocolInfo ? unixTimestampToSlotIndexConverter(protocolInfo) : null,
        slotIndexToTimeRange: protocolInfo ? slotIndexToUnixTimeRangeConverter(protocolInfo) : null,
    };
}
