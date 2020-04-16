import { asciiToTrytes, trytesToAscii } from "@iota/converter";

/**
 * Helper functions for use with text.
 */
export class TextHelper {
    /**
     * Encode Non ASCII characters to escaped characters.
     * @param value The value to encode.
     * @returns The encoded value.
     */
    public static encodeNonASCII(value: string): string | undefined {
        return value ?
            value.replace(/[\u007F-\uFFFF]/g, chr => `\\u${(`0000${chr.charCodeAt(0).toString(16)}`).substr(-4)}`)
            : undefined;
    }

    /**
     * Decode escaped Non ASCII characters.
     * @param value The value to decode.
     * @returns The decoded value.
     */
    public static decodeNonASCII(value: string): string | undefined {
        return value ?
            value.replace(/\\u([\d\w]{4})/gi, (match, grp) => String.fromCharCode(parseInt(grp, 16)))
            : undefined;
    }

    /**
     * Convert a string to Trytes.
     * @param str The string to encode.
     * @returns The encoded trytes value.
     */
    public static toTrytes(str: string): string {
        const encoded = TextHelper.encodeNonASCII(str);
        return encoded ? asciiToTrytes(encoded) : "";
    }

    /**
     * Convert a string from Trytes.
     * @param trytes The trytes to decode.
     * @returns The decoded string.
     */
    public static fromTrytes(trytes: string): string {
        if (trytes.length === 0) {
            return "";
        }

        if (!/^[9A-Z]*$/.test(trytes)) {
            throw new Error("Trytes must be characters A-Z or 9");
        }

        if (trytes.length % 2 === 1) {
            throw new Error(`Trytes must be an even length to decode to text, it is ${trytes.length}`);
        }

        const ascii = trytesToAscii(trytes);

        if (!ascii) {
            throw new Error(`Unable to decode the trytes to text`);
        }

        return TextHelper.decodeNonASCII(ascii) || "";
    }
}
