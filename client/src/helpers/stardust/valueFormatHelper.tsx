import { UnitsHelper } from "@iota/iota.js";
import { INodeInfoBaseToken } from "@iota/sdk-wasm/web";
import React from "react";
import Tooltip from "../../app/components/Tooltip";
/**
 * The id of the Genesis block.
 */
const GENESIS_BLOCK_ID = "0x0000000000000000000000000000000000000000000000000000000000000000";

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

    const formattedAmount = baseTokenValue < 1
        ? Number(baseTokenValue)
            .toLocaleString("en-US", { minimumFractionDigits: 6, maximumFractionDigits: 6, useGrouping: false })
            .replace(/\.?0+$/, "")
        : toFixedNoRound(baseTokenValue, decimalPlaces);

    // useMetricPrefix is broken cause it passes a float value to formatBest
    const amount = tokenInfo.useMetricPrefix
        ? UnitsHelper.formatBest(baseTokenValue)
        : `${formattedAmount} `;
    return `${amount}${tokenInfo.unit}`;
}

/**
 * Formats a number by adding commas as thousands separators.
 * @param {string|number} value - The number to format. Can be a string or a number.
 * @returns {string} The formatted number as a string, with commas separating thousands.
 */
export function formatNumberWithCommas(
    value: bigint
): string {
    return value.toLocaleString("en", { useGrouping: true });
}

/**
 * Format amount to two decimal places without rounding off.
 * @param value The raw amount to format.
 * @param precision The decimal places to show.
 * @returns The formatted amount.
 */
function toFixedNoRound(value: number, precision: number = 2): string {
    const strValue = value.toString();
    const dotIndex = strValue.indexOf(".");

    if (dotIndex === -1) { // No decimal point
        return `${strValue}.${"0".repeat(precision)}`;
    }

    // Calculate how many zeros need to be added
    const existingDecimals = strValue.length - dotIndex - 1;
    const neededZeros = precision - existingDecimals;

    const paddedValue = strValue + "0".repeat(neededZeros > 0 ? neededZeros : 0);
    return paddedValue.slice(0, dotIndex + precision + 1);
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
