/**
 * Helper functions for validating input.
 */
export class ValidationHelper {
    /**
     * Does the string have some content.
     * @param str The string to validate.
     * @param name The parameter name.
     */
    public static string(str: string, name: string): void {
        if (str === undefined || str === null || str.trim().length === 0) {
            throw new Error(`The parameter '${name}' has an invalid value.`);
        }
    }

    /**
     * Does the number have a value.
     * @param num The number to validate.
     * @param name The parameter name.
     */
    public static number(num: number, name: string): void {
        if (num === undefined || num === null || typeof num !== "number") {
            throw new Error(`The parameter '${name}' has an invalid value.`);
        }
    }

    /**
     * Is the value of one the specified items.
     * @param val The value to validate.
     * @param options The possible options.
     * @param name The parameter name.
     */
    public static oneOf(val: any, options: any[], name: string): void {
        if (options.indexOf(val) < 0) {
            throw new Error(`The parameter '${name}' has an invalid value.`);
        }
    }

    /**
     * Is the value trytes.
     * @param str The string to validate.
     * @param length The length to match.
     * @param name The parameter name.
     */
    public static trytes(str: string, length: number, name: string): void {
        if (!new RegExp(`^[A-Z9]{${length}}$`).test(str)) {
            throw new Error(`The parameter '${name}' has an invalid value.`);
        }
    }
}
