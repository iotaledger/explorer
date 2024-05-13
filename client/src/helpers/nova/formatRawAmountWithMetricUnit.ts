import { INodeInfoBaseToken } from "@iota/sdk-wasm-stardust/web";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";

const UNIT_MAP: { threshold: number; unit: string }[] = [
    { unit: "", threshold: 1 },
    { unit: "K", threshold: 1_000 },
    { unit: "M", threshold: 1_000_000 },
    { unit: "G", threshold: 1_000_000_000 },
    { unit: "T", threshold: 1_000_000_000_000 },
    { unit: "P", threshold: 1_000_000_000_000_000 },
];

const sortedUnits = UNIT_MAP.sort((a, b) => b.threshold - a.threshold);

/**
 * Format the best amount with metric unit.
 * @param value The value to format.
 * @returns The formatted string with the metric unit.
 */
function formatBestAmountWithMetric(value: number): string {
    for (const { threshold, unit } of sortedUnits) {
        if (value >= threshold) {
            return `${Math.floor(value / threshold)}${unit}`;
        }
    }

    return `${Math.floor(value)}`;
}

/**
 * Format token amount to metric unit.
 * @param value The raw amount to format.
 * @param tokenInfo The token info configuration to use.
 * @returns The formatted string with the metric unit.
 */
export function formatRawAmountWithMetricUnit(value: number | bigint | string, tokenInfo: INodeInfoBaseToken): string {
    if (Number.isNaN(value)) {
        return "";
    }

    const tokenAmount = parseInt(formatAmount(value, tokenInfo, false, 0).replace(tokenInfo.unit, ""));
    const formattedValue = formatBestAmountWithMetric(tokenAmount);

    // Remove iota unit if it exists
    const lastIotaIndex = formattedValue.lastIndexOf("i");
    if (lastIotaIndex === -1) return `${formattedValue} ${tokenInfo.unit}`;

    const formattedAmountWithToken =
        formattedValue.substring(0, lastIotaIndex) + formattedValue.substring(lastIotaIndex + 1) + ` ${tokenInfo.unit}`;

    return formattedAmountWithToken;
}
