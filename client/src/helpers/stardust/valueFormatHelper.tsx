import { Blake2b } from "@iota/crypto.js-stardust";
import { INodeInfoBaseToken, UnitsHelper } from "@iota/iota.js-stardust";
import { ReadStream } from "@iota/util.js-stardust";
import React from "react";
import Tooltip from "../../app/components/Tooltip";
/**
 * The id of the Genesis block.
 */
const GENESIS_BLOCK_ID = "0x0000000000000000000000000000000000000000000000000000000000000000";

/**
 * The length of the participation event id.
 */
const EVENT_ID_SIZE: number = Blake2b.SIZE_256;

/**
 * The participation event.
 */
interface Participation {
    /**
     * The event id.
     */
    eventId: string;

    /**
     * The number of answers.
     */
    answersCount?: number;

    /**
     * The list of answer values.
     */
    answers?: number[];
}

/**
 * Format amount using passed base token info.
 * @param value The raw amount to format.
 * @param tokenInfo The token info configuration to use.
 * @param formatFull The should format the value to base unit flag.
 * @param decimalPlaces The decimal places to show.
 * @returns The formatted string.
 */
export function formatAmount(
    value: number,
    tokenInfo: INodeInfoBaseToken,
    formatFull: boolean = false,
    decimalPlaces: number = 2
): string {
    if (formatFull) {
        return `${value} ${tokenInfo.subunit ?? tokenInfo.unit}`;
    }

    const baseTokenValue = value / Math.pow(10, tokenInfo.decimals);
    // useMetricPrefix is broken cause it passes a float value to formatBest
    const amount = tokenInfo.useMetricPrefix
        ? UnitsHelper.formatBest(baseTokenValue)
        : `${toFixedNoRound(baseTokenValue, decimalPlaces)} `;

        return `${amount}${tokenInfo.unit}`;
}

/**
 * Format amount to two decimal places without rounding off.
 * @param value The raw amount to format.
 * @param precision The decimal places to show.
 * @returns The formatted amount.
 */
function toFixedNoRound(value: number, precision: number = 2) {
    const factor = Math.pow(10, precision);
    return Math.floor(value * factor) / factor;
}

/**
 * Add tooltip content for special block id i.e Genesis block.
 * @param id The id of the block.
 * @returns The tooltip content or id.
 */
export function formatSpecialBlockId(id: string): React.ReactNode {
    if (id === GENESIS_BLOCK_ID) {
        return (
            <Tooltip tooltipContent="Genesis block">
                <span className="tooltip__special">{id}</span>
            </Tooltip>
        );
    }
    return id;
}

/**
 * Deserialize the participation event metadata from binary.
 * @param readStream The stream to read the data from.
 * @returns The deserialized object.
 */
export function deserializeParticipationEventMetadata(readStream: ReadStream): Participation[] {
    const participationsCount = readStream.readUInt8("participation.count");

    const participations: Participation[] = [];
    for (let i = 0; i < participationsCount; i++) {
        participations.push(deserializeParticipation(readStream));
    }

    return participations;
}

/**
 * Deserialize the participation event.
 * @param readStream The stream to read the data from.
 * @returns The deserialized object.
 */
export function deserializeParticipation(readStream: ReadStream): Participation {
    const eventId = readStream.readFixedHex("participation.eventId", EVENT_ID_SIZE);

    const answersCount = readStream.readUInt8("participation.answersCount");

    const answers: number[] = [];
    for (let i = 0; i < answersCount; i++) {
        answers.push(readStream.readUInt8(`participation.answers${i}`));
    }

    return {
        eventId,
        answersCount,
        answers
    };
}

