import { convertUnits, Unit } from "@iota/unit-converter";

/**
 * Class to help with units formatting.
 */
export class UnitsHelper {
    /**
     * Format the value in the best units.
     * @param value The value to format.
     * @returns The formated value.
     */
    public static formatBest(value: number): string {
        return UnitsHelper.formatUnits(value, UnitsHelper.calculateBest(value));
    }

    /**
     * Format the value in the best units.
     * @param value The value to format.
     * @param unit The unit for format with.
     * @returns The formated value.
     */
    public static formatUnits(value: number, unit: Unit): string {
        return unit === "i" ? `${value} i` : `${convertUnits(value, Unit.i, unit).toFixed(2)} ${unit}`;
    }

    /**
     * Format the value in the best units.
     * @param value The value to format.
     * @returns The best units for the value.
     */
    public static calculateBest(value: number): Unit {
        let bestUnits: Unit = Unit.i;
        const checkLength = Math.abs(value).toString().length;

        if (checkLength > 15) {
            bestUnits = Unit.Pi;
        } else if (checkLength > 12) {
            bestUnits = Unit.Ti;
        } else if (checkLength > 9) {
            bestUnits = Unit.Gi;
        } else if (checkLength > 6) {
            bestUnits = Unit.Mi;
        } else if (checkLength > 3) {
            bestUnits = Unit.Ki;
        }

        return bestUnits;
    }
}
