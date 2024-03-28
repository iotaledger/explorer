import {
    AddressType,
    Block,
    FeatureType,
    InputType,
    OutputType,
    PayloadType,
    UnlockConditionType,
    UnlockType,
} from "@iota/sdk-wasm-stardust/web";

export class NameHelper {
    /**
     * Get the name for the input type.
     * @param type The type to get the name for.
     * @returns The input type name.
     */
    public static getInputTypeName(type: number): string {
        if (type === InputType.UTXO) {
            return "UTXO Input";
        } else if (type === InputType.Treasury) {
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
            case OutputType.Basic: {
                return "Basic";
            }
            case OutputType.Alias: {
                return "Alias";
            }
            case OutputType.Foundry: {
                return "Foundry";
            }
            case OutputType.Nft: {
                return "NFT";
            }
            case OutputType.Treasury: {
                return "Treasury";
            }
            default: {
                return "Unknown";
            }
        }
    }

    /**
     * Get the name for the unlock type.
     * @param type The type to get the name for.
     * @returns The unlock type name.
     */
    public static getUnlockTypeName(type: number): string {
        switch (type) {
            case UnlockType.Alias: {
                return "Alias Unlock";
            }
            case UnlockType.Nft: {
                return "NFT Unlock";
            }
            case UnlockType.Signature: {
                return "Signature Unlock";
            }
            case UnlockType.Reference: {
                return "Reference Unlock";
            }
            default: {
                return "Unknown Unlock";
            }
        }
    }

    /**
     * Get the name for the unlock condition type.
     * @param type The type to get the name for.
     * @returns The unlock condition type name.
     */
    public static getUnlockConditionTypeName(type: number): string {
        if (type === UnlockConditionType.Address) {
            return "Address Unlock Condition";
        } else if (type === UnlockConditionType.StorageDepositReturn) {
            return "Storage Deposit Return Unlock Condition";
        } else if (type === UnlockConditionType.Timelock) {
            return "Timelock Unlock Condition";
        } else if (type === UnlockConditionType.Expiration) {
            return "Expiration Unlock Condition";
        } else if (type === UnlockConditionType.StateControllerAddress) {
            return "State Controller Address Unlock Condition";
        } else if (type === UnlockConditionType.GovernorAddress) {
            return "Governor Unlock Condition";
        } else if (type === UnlockConditionType.ImmutableAliasAddress) {
            return "Immutable Alias Unlock Condition";
        }
        return "Unknown Unlock Condition";
    }

    /**
     * Get the name for the feature type.
     * @param type The type to get the name for.
     * @param isImmutable Is the feature immutable.
     * @returns The feature type name.
     */
    public static getFeatureTypeName(type: number, isImmutable: boolean): string {
        let name: string = "";
        if (type === FeatureType.Sender) {
            name = "Sender";
        } else if (type === FeatureType.Issuer) {
            name = "Issuer";
        } else if (type === FeatureType.Metadata) {
            name = "Metadata";
        } else if (type === FeatureType.Tag) {
            name = "Tag";
        }

        if (name) {
            return isImmutable ? `Immutable ${name}` : name;
        }
        return "Unknown Feature";
    }

    /**
     * Get the name for the address type.
     * @param type The type to get the name for.
     * @returns The address type name.
     */
    public static getAddressTypeName(type: number): string {
        if (type === AddressType.Ed25519) {
            return "Ed25519 address";
        } else if (type === AddressType.Alias) {
            return "Alias address";
        } else if (type === AddressType.Nft) {
            return "NFT address";
        }
        return "Unknown Address Type";
    }

    /**
     * Compute a payload type string from block.
     * @param block The block data.
     * @returns The payload type string.
     */
    public static getPayloadType(block: Block | undefined): string {
        let payloadType = "-";

        if (!block) {
            return payloadType;
        }

        switch (block.payload?.type) {
            case PayloadType.TaggedData: {
                payloadType = "Data";
                break;
            }
            case PayloadType.Transaction: {
                payloadType = "Transaction";
                break;
            }
            case PayloadType.Milestone: {
                payloadType = "Milestone";
                break;
            }
            case PayloadType.TreasuryTransaction: {
                payloadType = "Treasury Transaction";
                break;
            }
            default: {
                payloadType = "No payload";
                break;
            }
        }

        return payloadType;
    }
}
