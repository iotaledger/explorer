import { ALIAS_OUTPUT_TYPE, ALIAS_UNLOCK_TYPE, BASIC_OUTPUT_TYPE, FOUNDRY_OUTPUT_TYPE, NFT_OUTPUT_TYPE,
    NFT_UNLOCK_TYPE, REFERENCE_UNLOCK_TYPE, SIGNATURE_UNLOCK_TYPE, TREASURY_INPUT_TYPE,
    TREASURY_OUTPUT_TYPE, UTXO_INPUT_TYPE, ADDRESS_UNLOCK_CONDITION_TYPE, STORAGE_DEPOSIT_RETURN_UNLOCK_CONDITION_TYPE,
    TIMELOCK_UNLOCK_CONDITION_TYPE, EXPIRATION_UNLOCK_CONDITION_TYPE, STATE_CONTROLLER_ADDRESS_UNLOCK_CONDITION_TYPE,
    GOVERNOR_ADDRESS_UNLOCK_CONDITION_TYPE, IMMUTABLE_ALIAS_UNLOCK_CONDITION_TYPE, SENDER_FEATURE_TYPE,
    ISSUER_FEATURE_TYPE, METADATA_FEATURE_TYPE, TAG_FEATURE_TYPE,
    ED25519_ADDRESS_TYPE, ALIAS_ADDRESS_TYPE, NFT_ADDRESS_TYPE } from "@iota/iota.js-stardust";

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
        switch (type) {
            case BASIC_OUTPUT_TYPE:
                return "Basic Output";
            case ALIAS_OUTPUT_TYPE:
                return "Alias Output";
            case FOUNDRY_OUTPUT_TYPE:
                return "Foundry Output";
            case NFT_OUTPUT_TYPE:
                return "NFT Output";
            case TREASURY_OUTPUT_TYPE:
                return "Treasury Output";
            default:
                return "Unknown Output";
        }
    }

    /**
     * Get the name for the unlock type.
     * @param type The type to get the name for.
     * @returns The unlock type name.
     */
    public static getUnlockTypeName(type: number): string {
        switch (type) {
            case ALIAS_UNLOCK_TYPE:
                return "Alias Unlock";
            case NFT_UNLOCK_TYPE:
                return "NFT Unlock";
            case SIGNATURE_UNLOCK_TYPE:
                return "Signature Unlock";
            case REFERENCE_UNLOCK_TYPE:
                return "Reference Unlock";
            default:
                return "Unknown Unlock";
        }
    }

    /**
     * Get the name for the unlock condition type.
     * @param type The type to get the name for.
     * @returns The unlock condition type name.
     */
     public static getUnlockConditionTypeName(type: number): string {
        if (type === ADDRESS_UNLOCK_CONDITION_TYPE) {
            return "Address Unlock Condition";
        } else if (type === STORAGE_DEPOSIT_RETURN_UNLOCK_CONDITION_TYPE) {
            return "Storage Desposit Return Unlock Condition";
        } else if (type === TIMELOCK_UNLOCK_CONDITION_TYPE) {
            return "Timelock Unlock Condition";
        } else if (type === EXPIRATION_UNLOCK_CONDITION_TYPE) {
            return "Expiration Unlock Condition";
        } else if (type === STATE_CONTROLLER_ADDRESS_UNLOCK_CONDITION_TYPE) {
            return "State Controller Address Unlock Condition";
        } else if (type === GOVERNOR_ADDRESS_UNLOCK_CONDITION_TYPE) {
            return "Governor Unlock Condition";
        } else if (type === IMMUTABLE_ALIAS_UNLOCK_CONDITION_TYPE) {
            return "Immutable Alias Unlock Condition";
        }
        return "Unknown Unlock Condition";
    }

    /**
     * Get the name for the feature type.
     * @param type The type to get the name for.
     * @returns The feature type name.
     */
    public static getFeatureTypeName(type: number): string {
        if (type === SENDER_FEATURE_TYPE) {
            return "Sender Feature";
        } else if (type === ISSUER_FEATURE_TYPE) {
            return "Issuer Feature";
        } else if (type === METADATA_FEATURE_TYPE) {
            return "Metadata Feature";
        } else if (type === TAG_FEATURE_TYPE) {
            return "Tag Feature";
        }
        return "Unknown Feature";
    }

    /**
     * Get the name for the address type.
     * @param type The type to get the name for.
     * @returns The address type name.
     */
     public static getAddressTypeName(type: number): string {
        if (type === ED25519_ADDRESS_TYPE) {
            return "Ed25519 address";
        } else if (type === ALIAS_ADDRESS_TYPE) {
            return "Alias address";
        } else if (type === NFT_ADDRESS_TYPE) {
            return "NFT address";
        }
        return "Unknown Address Type";
    }
}

