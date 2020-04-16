import { convertUnits, Unit } from "@iota/unit-converter";

/**
 * Class to help with units formatting.
 */
export class UnitsHelper {
    /**
     * Format the value in the best units.
     * @param value The value to format.
     * @param includeI Include the long i version of the value.
     * @returns The formated value.
     */
    public static formatBest(value: number, includeI: boolean = true): string {
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

        let ret;

        if (bestUnits === "i") {
            ret = `${value} i`;
        } else {
            ret = `${convertUnits(value, Unit.i, bestUnits).toFixed(2)} ${bestUnits}`;

            if (includeI) {
                ret += ` [${value} i]`;
            }
        }

        return ret;
    }
}
