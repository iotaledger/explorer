import { REFERENCE_UNLOCK_BLOCK_TYPE, SIGNATURE_UNLOCK_BLOCK_TYPE, SIG_LOCKED_DUST_ALLOWANCE_OUTPUT_TYPE, SIG_LOCKED_SINGLE_OUTPUT_TYPE, TREASURY_INPUT_TYPE, TREASURY_OUTPUT_TYPE, UTXO_INPUT_TYPE } from "@iota/iota.js";

export class NameHelper {
    /**
     * Get the name for the input type.
     * @param type The type to get the name for.
     * @returns The input type name.
     */
    public static getInputTypeName(type: number): string {
        if (type === UTXO_INPUT_TYPE) {
            return "UTXO Input";
        } else if (type === TREASURY_INPUT_TYPE) {
            return "Treasury Input";
        }
        return "Unknown Input";
    }

    /**
     * Get the name for the output type.
     * @param type The type to get the name for.
     * @returns The output type name.
     */
    public static getOutputTypeName(type: number): string {
        if (type === SIG_LOCKED_SINGLE_OUTPUT_TYPE) {
            return "Signature Locked Single Output";
        } else if (type === SIG_LOCKED_DUST_ALLOWANCE_OUTPUT_TYPE) {
            return "Signature Locked Dust Allowance Output";
        } else if (type === TREASURY_OUTPUT_TYPE) {
            return "Treasury Output";
        }
        return "Unknown Output";
    }

    /**
     * Get the name for the unlock block type.
     * @param type The type to get the name for.
     * @returns The unlock block type name.
     */
    public static getUnlockBlockTypeName(type: number): string {
        if (type === SIGNATURE_UNLOCK_BLOCK_TYPE) {
            return "Signature Unlock Block";
        } else if (type === REFERENCE_UNLOCK_BLOCK_TYPE) {
            return "Reference Unlock Block";
        }
        return "Unknown Unlock Block";
    }
}

