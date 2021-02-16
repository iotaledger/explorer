
/**
 * Class to help with currency formatting.
 */
export class CurrencyHelper {
    /**
     * The group separator.
     */
    private static _groupSeparator?: string;

    /**
     * The decimal separator.
     */
    private static _decimalSeparator?: string;

    /**
     * Format the currency using locale.
     * @param value The value to format.
     * @returns The formated value.
     */
    public static formatLocale(value: number): string {
        return new Intl.NumberFormat(undefined).format(value);
    }

    /**
     * Parse the currency using locale.
     * @param value The value to parse.
     * @returns The parsed value.
     */
    public static parseLocale(value: string): number {
        CurrencyHelper.buildSeparators();
        if (CurrencyHelper._decimalSeparator && CurrencyHelper._groupSeparator) {
            return Number.parseFloat(
                value
                    .replace(new RegExp(CurrencyHelper._groupSeparator, "g"), "")
                    .replace(new RegExp(CurrencyHelper._decimalSeparator), ".")
                    .replace(/\s/g, "")
            );
        }
        return Number.parseFloat(value);
    }

    /**
     * Build the separators.
     */
    public static buildSeparators(): void {
        if (!CurrencyHelper._groupSeparator || !CurrencyHelper._decimalSeparator) {
            CurrencyHelper._groupSeparator = ",";
            CurrencyHelper._decimalSeparator = ".";
            if (Intl) {
                const numberWithDecimalSeparator = 123456.7;
                // eslint-disable-next-line new-cap
                const numFormat = Intl.NumberFormat();
                if (numFormat) {
                    const parts = numFormat.formatToParts(numberWithDecimalSeparator);

                    if (parts) {
                        const decimal = parts.find(part => part.type === "decimal");

                        if (decimal) {
                            CurrencyHelper._decimalSeparator = decimal.value;
                        }

                        const group = parts.find(part => part.type === "group");

                        if (group) {
                            CurrencyHelper._groupSeparator = group.value;
                        }
                    }
                }
            }

            // If we are using these in regex we need to escape . or it will replace every character.
            if (CurrencyHelper._decimalSeparator === ".") {
                CurrencyHelper._decimalSeparator = "\\.";
            }
            if (CurrencyHelper._groupSeparator === ".") {
                CurrencyHelper._groupSeparator = "\\.";
            }
        }
    }
}
