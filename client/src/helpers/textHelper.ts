/* eslint-disable no-bitwise */
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
        return value
            ? // eslint-disable-next-line unicorn/prefer-code-point
              value.replaceAll(/[\u007F-\uFFFF]/g, (chr) => `\\u${`0000${chr.charCodeAt(0).toString(16)}`.slice(-4)}`)
            : undefined;
    }

    /**
     * Decode escaped Non ASCII characters.
     * @param value The value to decode.
     * @returns The decoded value.
     */
    public static decodeNonASCII(value: string): string | undefined {
        return value
            ? value.replaceAll(/\\u(\w{4})/gi, (_match, grp) => String.fromCodePoint(Number.parseInt(grp as string, 16)))
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
            throw new Error("Unable to decode the trytes to text");
        }

        return TextHelper.decodeNonASCII(ascii) ?? "";
    }

    /**
     * Check if a text contains valid UTF-8 characters.
     * @param text The text to validate.
     * @returns true if the text is valid or not.
     */
    public static isUTF8(text: Uint8Array): boolean {
        let expectedLength = 0;
        for (let i = 0; i < text.length; i++) {
            if ((text[i] & 0b10000000) === 0b00000000) {
                expectedLength = 1;
            } else if ((text[i] & 0b11100000) === 0b11000000) {
                expectedLength = 2;
            } else if ((text[i] & 0b11110000) === 0b11100000) {
                expectedLength = 3;
            } else if ((text[i] & 0b11111000) === 0b11110000) {
                expectedLength = 4;
            } else if ((text[i] & 0b11111100) === 0b11111000) {
                expectedLength = 5;
            } else if ((text[i] & 0b11111110) === 0b11111100) {
                expectedLength = 6;
            } else {
                return false;
            }

            while (--expectedLength > 0) {
                if (++i >= text.length) {
                    return false;
                }
                if ((text[i] & 0b11000000) !== 0b10000000) {
                    return false;
                }
            }
        }

        return true;
    }
}
