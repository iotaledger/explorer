import { INodeInfoBaseToken } from "@iota/sdk-wasm-stardust/web";
import React from "react";
import Tooltip from "~app/components/Tooltip";
import BigDecimal from "../bigDecimal";

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
    value: number | bigint | string,
    tokenInfo: INodeInfoBaseToken,
    formatFull: boolean = false,
    decimalPlaces: number = 2,
    trailingDecimals?: boolean,
): string {
    if (value === null || value === undefined || value === "" || isNaN(Number(value))) {
        return "";
    }

    if (formatFull) {
        return `${value} ${tokenInfo.subunit ?? tokenInfo.unit}`;
    }

    const valueBigDecimal =
        typeof value === "string"
            ? new BigDecimal(value, tokenInfo.decimals, false)
            : new BigDecimal(value.toString(), tokenInfo.decimals, false);

    const baseTokenValue = valueBigDecimal.divide(Math.pow(10, tokenInfo.decimals).toString());
    const formattedAmount = toFixedNoRound(baseTokenValue.toString(), decimalPlaces, trailingDecimals);

    return `${formattedAmount} ${tokenInfo.unit}`;
}

/**
 * Formats a number by adding commas as thousands separators.
 * @param {string|number} value - The number to format. Can be a string or a number.
 * @returns {string} The formatted number as a string, with commas separating thousands.
 */
export function formatNumberWithCommas(value: bigint): string {
    return value.toLocaleString("en", { useGrouping: true });
}

function trimTrailingZeros(numberStr: string) {
    return numberStr.replace(/\.0+$|(\.\d*?)0+$/, "$1");
}

/**
 * Format amount to two decimal places without rounding off.
 * @param value The raw amount to format.
 * @param precision The decimal places to show.
 * @param forceShowDecimal The should show decimal anyway.
 * @returns The formatted amount.
 */
function toFixedNoRound(value: number | string, precision: number = 2, forceShowDecimal?: boolean): string {
    const [integer, fraction = ""] = `${value}`.split(".");
    const truncatedFraction = fraction.padEnd(precision, "0").substring(0, precision);

    if (forceShowDecimal) {
        return `${integer}.${truncatedFraction}`;
    }

    if (Number(integer) === 0) {
        if (Number(fraction) === 0) {
            return integer;
        }
        if (Number(truncatedFraction) === 0) {
            return `${integer}.${fraction}`;
        }
        return trimTrailingZeros(`${integer}.${truncatedFraction}`);
    }

    if (!precision) {
        return integer;
    }

    return trimTrailingZeros(`${integer}.${truncatedFraction}`);
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
