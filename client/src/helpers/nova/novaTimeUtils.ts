import { ProtocolInfo } from "@iota/sdk-wasm-nova/web";

// Note: genesisUnixTimestamp is the first second that falls into genesisSlot + 1

/**
 * Convert a UNIX timestamp to a slot index.
 * @param protocolInfo The protocol information.
 * @param unixTimestampSeconds The UNIX timestamp in seconds.
 * @returns The slot index.
 */
export function unixTimestampToSlotIndexConverter(protocolInfo: ProtocolInfo): (unixTimestampSeconds: number) => number {
    return (unixTimestampSeconds: number) => {
        const genesisSlot = protocolInfo.parameters.genesisSlot;
        const genesisUnixTimestamp = protocolInfo.parameters.genesisUnixTimestamp;
        const slotDurationInSeconds = protocolInfo.parameters.slotDurationInSeconds;

        const elapsedTime = unixTimestampSeconds - Number(genesisUnixTimestamp);

        if (elapsedTime < 0) {
            return genesisSlot;
        }

        return genesisSlot + Math.floor(elapsedTime / slotDurationInSeconds) + 1;
    };
}

/**
 * Convert a slot index to a UNIX time range, in seconds.
 * @param protocolInfo The protocol information.
 * @param targetSlotIndex The target slot index.
 * @returns The UNIX time range in seconds: from (inclusive) and to (exclusive).
 */
export function slotIndexToUnixTimeRangeConverter(protocolInfo: ProtocolInfo): (targetSlotIndex: number) => { from: number; to: number } {
    return (targetSlotIndex: number) => {
        const genesisSlot = protocolInfo.parameters.genesisSlot;
        const genesisUnixTimestamp = Number(protocolInfo.parameters.genesisUnixTimestamp);
        const slotDurationInSeconds = protocolInfo.parameters.slotDurationInSeconds;

        if (targetSlotIndex <= genesisSlot) {
            return {
                from: genesisUnixTimestamp - slotDurationInSeconds,
                to: genesisUnixTimestamp,
            };
        }

        const slotsElapsed = targetSlotIndex - genesisSlot - 1;
        const elapsedTime = slotsElapsed * slotDurationInSeconds;
        const targetSlotFromTimestamp = Number(genesisUnixTimestamp) + elapsedTime;

        return {
            from: targetSlotFromTimestamp,
            to: targetSlotFromTimestamp + slotDurationInSeconds,
        };
    };
}

/**
 * Convert a slot index to an epoch index.
 * @param protocolInfo The protocol information.
 * @param targetSlotIndex The target slot index.
 * @returns The epoch index.
 */
export function slotIndexToEpochIndexConverter(protocolInfo: ProtocolInfo): (targetSlotIndex: number) => number {
    return (targetSlotIndex: number) => {
        const slotsPerEpochExponent = protocolInfo.parameters.slotsPerEpochExponent;
        return targetSlotIndex >> slotsPerEpochExponent;
    };
}

/**
 * Convert a UNIX timestamp to an epoch index.
 * @param protocolInfo The protocol information.
 * @param unixTimestampSeconds The UNIX timestamp in seconds.
 * @returns The epoch index.
 */
export function unixTimestampToEpochIndexConverter(protocolInfo: ProtocolInfo): (unixTimestampSeconds: number) => number {
    return (unixTimestampSeconds: number) => {
        const slotsPerEpochExponent = protocolInfo.parameters.slotsPerEpochExponent;
        const unixTimestampToSlotIndex = unixTimestampToSlotIndexConverter(protocolInfo);

        const targetSlotIndex = unixTimestampToSlotIndex(unixTimestampSeconds);
        return targetSlotIndex >> slotsPerEpochExponent;
    };
}
