import { INodeInfoBaseToken, UnitsHelper } from "@iota/iota.js-stardust";

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
        return `${value} ${tokenInfo.subunit ? tokenInfo.subunit : tokenInfo.unit}`;
    }
    const baseTokenValue = value / Math.pow(10, tokenInfo.decimals);
    const amount = tokenInfo.useMetricPrefix
        ? UnitsHelper.formatBest(baseTokenValue)
        : `${Number.parseFloat(baseTokenValue.toFixed(decimalPlaces))} `;

        return `${amount}${tokenInfo.unit}`;
}
