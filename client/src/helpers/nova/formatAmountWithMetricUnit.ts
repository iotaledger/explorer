import { INodeInfoBaseToken } from "@iota/sdk-wasm-stardust/web";
import { UnitsHelper } from "@iota/iota.js";

/**
 * Format token amount to metric unit.
 * @param value The raw amount to format.
 * @param tokenInfo The token info configuration to use.
 * @returns The formatted string with the metric unit.
 */
export function formatAmountWithMetricUnit(value: number | bigint | string, tokenInfo: INodeInfoBaseToken): string {
    const amount = Number(value);

    if (Number.isNaN(value)) {
        return "";
    }

    const formattedValue = UnitsHelper.formatBest(amount, 0);

    // remove leading lowercase "i" from formatted value
    const lastIIndex = formattedValue.lastIndexOf("i");
    if (lastIIndex === -1) return `${formattedValue} ${tokenInfo.unit}`;

    const formattedAmountWithToken =
        formattedValue.substring(0, lastIIndex) + formattedValue.substring(lastIIndex + 1) + `${tokenInfo.unit}`;

    return formattedAmountWithToken;
}
