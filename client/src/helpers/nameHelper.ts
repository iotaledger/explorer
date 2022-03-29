import { 
    ALIAS_OUTPUT_TYPE,
    ALIAS_UNLOCK_BLOCK_TYPE,
    BASIC_OUTPUT_TYPE,
    FOUNDRY_OUTPUT_TYPE,
    NFT_OUTPUT_TYPE,
    NFT_UNLOCK_BLOCK_TYPE,
    REFERENCE_UNLOCK_BLOCK_TYPE,
    SIGNATURE_UNLOCK_BLOCK_TYPE,
    TREASURY_INPUT_TYPE,
    TREASURY_OUTPUT_TYPE,
    UTXO_INPUT_TYPE
} from "@iota/iota.js";

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
        switch(type) {
            case BASIC_OUTPUT_TYPE:
                return "Basic Output"
            case ALIAS_OUTPUT_TYPE:
                return "Alias Output"
            case FOUNDRY_OUTPUT_TYPE:
                return "Foundry Output"
            case NFT_OUTPUT_TYPE:
                return "NFT Output"
            case TREASURY_OUTPUT_TYPE:
                return "Treasury Output";
            default:
                return "Unknown Output";
        }
    }

    /**
     * Get the name for the unlock block type.
     * @param type The type to get the name for.
     * @returns The unlock block type name.
     */
    public static getUnlockBlockTypeName(type: number): string {
        switch (type) {
            case ALIAS_UNLOCK_BLOCK_TYPE:
                return "Alias Unlock Block"
            case NFT_UNLOCK_BLOCK_TYPE:
                return "NFT Unlock Block"
            case SIGNATURE_UNLOCK_BLOCK_TYPE:
                return "Signature Unlock Block";
            case REFERENCE_UNLOCK_BLOCK_TYPE:
                return "Reference Unlock Block";
            default:
                return "Unknown Unlock Block";
        }
    }
}

