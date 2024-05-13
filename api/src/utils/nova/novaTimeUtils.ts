/* eslint-disable no-bitwise */
import { ProtocolParameters } from "@iota/sdk-nova";

// Note: genesisUnixTimestamp is the first second that falls into genesisSlot + 1

/**
 * Convert a UNIX timestamp to a slot index.
 * @param parameters The protocol parameters information.
 * @returns The slot index.
 */
export function unixTimestampToSlotIndexConverter(parameters: ProtocolParameters): (unixTimestampSeconds: number) => number {
    return (unixTimestampSeconds: number) => {
        const genesisSlot = parameters.genesisSlot;
        const genesisUnixTimestamp = parameters.genesisUnixTimestamp;
        const slotDurationInSeconds = parameters.slotDurationInSeconds;

        const elapsedTime = unixTimestampSeconds - Number(genesisUnixTimestamp);

        if (elapsedTime < 0) {
            return genesisSlot;
        }

        return genesisSlot + Math.floor(elapsedTime / slotDurationInSeconds) + 1;
    };
}

/**
 * Convert a slot index to a UNIX time range, in seconds.
 * @param parameters The protocol parameters information.
 * @returns The UNIX time range in seconds: from (inclusive) and to (exclusive).
 */
export function slotIndexToUnixTimeRangeConverter(
    parameters: ProtocolParameters,
): (targetSlotIndex: number) => { from: number; to: number } {
    return (targetSlotIndex: number) => {
        const genesisSlot = parameters.genesisSlot;
        const genesisUnixTimestamp = Number(parameters.genesisUnixTimestamp);
        const slotDurationInSeconds = parameters.slotDurationInSeconds;

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
 * @param parameters The protocol parameters information.
 * @returns The epoch index.
 */
export function slotIndexToEpochIndexConverter(parameters: ProtocolParameters): (targetSlotIndex: number) => number {
    return (targetSlotIndex: number) => {
        const genesisSlot = parameters.genesisSlot;
        const slotsPerEpochExponent = parameters.slotsPerEpochExponent;

        if (targetSlotIndex < genesisSlot) {
            return 0;
        }

        return (targetSlotIndex - genesisSlot) >>> slotsPerEpochExponent;
    };
}

/**
 * Convert a UNIX timestamp to an epoch index.
 * @param parameters The protocol parameters information.
 * @returns The epoch index.
 */
export function unixTimestampToEpochIndexConverter(parameters: ProtocolParameters): (unixTimestampSeconds: number) => number {
    return (unixTimestampSeconds: number) => {
        const unixTimestampToSlotIndex = unixTimestampToSlotIndexConverter(parameters);
        const slotIndexToEpochIndex = slotIndexToEpochIndexConverter(parameters);

        const targetSlotIndex = unixTimestampToSlotIndex(unixTimestampSeconds);

        return slotIndexToEpochIndex(targetSlotIndex);
    };
}

/**
 * Convert an epoch index to a slot index range.
 * @param parameters The protocol parameters information.
 * @returns The slot index range in seconds: from (inclusive) and to (exclusive).
 */
export function epochIndexToSlotIndexRangeConverter(
    parameters: ProtocolParameters,
): (targetEpochIndex: number) => { from: number; to: number } {
    return (targetEpochIndex: number) => {
        const slotsPerEpochExponent = parameters.slotsPerEpochExponent;
        const genesisSlot = parameters.genesisSlot;

        return {
            from: genesisSlot + (targetEpochIndex << slotsPerEpochExponent),
            to: genesisSlot + ((targetEpochIndex + 1) << slotsPerEpochExponent),
        };
    };
}

/**
 * Convert an epoch index to a UNIX time range, in seconds.
 * @param parameters The protocol parameters information.
 * @returns The UNIX time range in seconds: from (inclusive) and to (exclusive).
 */
export function epochIndexToUnixTimeRangeConverter(
    parameters: ProtocolParameters,
): (targetEpochIndex: number) => { from: number; to: number } {
    return (targetEpochIndex: number) => {
        const epochIndexToSlotIndexRange = epochIndexToSlotIndexRangeConverter(parameters);
        const slotIndexToUnixTimeRange = slotIndexToUnixTimeRangeConverter(parameters);

        const targetEpochSlotIndexRange = epochIndexToSlotIndexRange(targetEpochIndex);

        return {
            from: slotIndexToUnixTimeRange(targetEpochSlotIndexRange.from).from,
            to: slotIndexToUnixTimeRange(targetEpochSlotIndexRange.to).from,
        };
    };
}

/**
 * Get the registration slot from an epoch index.
 * @param parameters The protocol parameters information.
 * @returns The registration slot index.
 */
export function getRegistrationSlotFromEpochIndex(parameters: ProtocolParameters): (targetEpochIndex: number) => number {
    return (targetEpochIndex: number) => {
        const epochNearingThreshold = parameters.epochNearingThreshold;
        const epochIndexToSlotIndexRange = epochIndexToSlotIndexRangeConverter(parameters);

        const nextEpochSlotIndexRange = epochIndexToSlotIndexRange(targetEpochIndex + 1);

        const registrationSlot = nextEpochSlotIndexRange.from - epochNearingThreshold - 1;

        return registrationSlot;
    };
}
