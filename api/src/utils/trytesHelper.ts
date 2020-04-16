import { TRYTE_ALPHABET } from "@iota/converter";
import * as crypto from "crypto";

/**
 * Helper functions for use with trytes.
 */
export class TrytesHelper {
    /**
     * Generate a random hash.
     * @param length The length of the hash.
     * @returns The hash.
     */
    public static generateHash(length: number = 81): string {
        let hash = "";

        while (hash.length < length) {
            const byte = crypto.randomBytes(1);
            if (byte[0] < 243) {
                hash += TRYTE_ALPHABET.charAt(byte[0] % 27);
            }
        }

        return hash;
    }
}
