import { asciiToTrytes, trytesToAscii, trytesToTrits, TRYTE_ALPHABET } from "@iota/converter";
import { randomBytes } from "crypto";
import { TextHelper } from "./textHelper";

/**
 * Helper functions for use with trytes.
 */
export class TrytesHelper {
    /**
     * Convert an object to Trytes.
     * @param obj The obj to encode.
     * @returns The encoded trytes value.
     */
    public static toTrytes(obj: unknown): string {
        const json = JSON.stringify(obj);
        const encoded = TextHelper.encodeNonASCII(json);
        return encoded ? asciiToTrytes(encoded) : "";
    }

    /**
     * Convert an object from Trytes.
     * @param trytes The trytes to decode.
     * @returns The decoded object.
     */
    public static fromTrytes<T>(trytes: string): T | undefined {
        // Trim trailing 9s
        let trimmed = trytes.replace(/\9+$/, "");

        // And make sure it is even length (2 trytes per ascii char)
        if (trimmed.length % 2 === 1) {
            trimmed += "9";
        }

        const ascii = trytesToAscii(trimmed);
        const json = TextHelper.decodeNonASCII(ascii);

        return json ? JSON.parse(json) as T : undefined;
    }

    /**
     * Decode the trytes data.
     * @param trytes The trytes to decode.
     * @returns The decoded message.
     */
    public static decodeMessage(trytes: string): {
        /**
         * The decoded message.
         */
        message: string;
        /**
         * Is the message plain text.
         */
        messageType: "Trytes" | "ascii" | "JSON";
    } {
        let message = trytes;
        let messageType: "Trytes" | "ascii" | "JSON" = "Trytes";
        try {
            // Trim trailing 9s
            let trimmed = message.replace(/\9+$/, "");

            if (trimmed.length === 0) {
                messageType = "Trytes";
            } else {
                // And make sure it is even length (2 trytes per ascii char)
                if (trimmed.length % 2 === 1) {
                    trimmed += "9";
                }

                const ascii = trytesToAscii(trimmed);

                // Only display as ascii text if the characters are printable
                if (/^[\t\n\r\u0020-\u007F]*$/.test(ascii)) {
                    const decoded = TextHelper.decodeNonASCII(ascii);

                    if (decoded) {
                        try {
                            const obj = JSON.parse(decoded);
                            if (obj) {
                                message = JSON.stringify(obj, undefined, "   ");
                                messageType = "JSON";
                            }
                        } catch {
                            message = decoded;
                            messageType = "ascii";
                        }
                    }
                }
            }
        } catch {
        }

        return {
            message,
            messageType
        };
    }

    /**
     * Generate a random hash.
     * @param length The length of the hash.
     * @returns The hash.
     */
    public static generateHash(length: number = 81): string {
        let hash = "";

        while (hash.length < length) {
            const byte = randomBytes(1);
            if (byte[0] < 243) {
                hash += TRYTE_ALPHABET.charAt(byte[0] % 27);
            }
        }

        return hash;
    }

    /**
     * Calculate the mwm or the hash.
     * @param hash The hash to calculate the mwm for.
     * @returns The mwm.
     */
    public static calculateMwm(hash: string): number {
        const trits = trytesToTrits(hash);

        let mwm = 0;
        for (let i = trits.length - 1; i >= 0; i--) {
            if (trits[i] !== 0) {
                break;
            }
            mwm++;
        }
        return mwm;
    }

    /**
     * Is the string trytes of any length.
     * @param trytes The trytes to test.
     * @returns True if it is trytes.
     */
    public static isTrytes(trytes: string): boolean {
        return /^[9A-Z]+$/.test(trytes);
    }

    /**
     * Is the string trytes all 9s.
     * @param trytes The trytes to test.
     * @returns True if it is trytes.
     */
    public static isEmpty(trytes: string): boolean {
        return /^9*$/.test(trytes);
    }
}
