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

    // Remove iota unit if it exists
    const lastIotaIndex = formattedValue.lastIndexOf("i");
    if (lastIotaIndex === -1) return `${formattedValue} ${tokenInfo.unit}`;

    const formattedAmountWithToken =
        formattedValue.substring(0, lastIotaIndex) + formattedValue.substring(lastIotaIndex + 1) + `${tokenInfo.unit}`;

    return formattedAmountWithToken;
}
