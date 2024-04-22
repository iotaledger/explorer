export class NumberHelper {
    /**
     * Get the number rounded to n decimals.
     * @param number The number to get rounded.
     * @param decimals The number of decimals.
     * @returns The number rounded.
     */
    public static roundTo(number: number, decimals: number): number {
        return Math.round(number * 10 * decimals) / (10 * decimals);
    }

    public static isNumeric(value: string): boolean {
        return /^-?\d+$/.test(value);
    }

    public static isNumber(value?: number | null): boolean {
        return value !== null && value !== undefined && !isNaN(value);
    }

    public static sumValues(...args: (bigint | number | string | null | undefined)[]): number {
        return args.reduce<number>((acc, cur) => {
            const value = cur || 0; // Convert null or undefined to 0
            if (typeof value === "bigint" || typeof value === "number") {
                return acc + Number(value);
            } else if (typeof value === "string") {
                return acc + Number(value) || 0;
            } else {
                return acc;
            }
        }, 0);
    }
}
