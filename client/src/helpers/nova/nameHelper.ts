import { AddressType, FeatureType, OutputType, PayloadType, UnlockType } from "@iota/sdk-wasm-nova/web";

export class NameHelper {
    /**
     * Get the label for an address type.
     * @param type The address type to get the name for.
     * @returns The address type name.
     */
    public static getAddressTypeName(type: AddressType, isRestricted = false): string {
        switch (type) {
            case AddressType.Ed25519:
                return "Ed25519";
            case AddressType.Account:
                return "Account";
            case AddressType.Nft:
                return "Nft";
            case AddressType.Anchor:
                return "Anchor";
            case AddressType.ImplicitAccountCreation:
                return "ImplicitAccountCreation";
            case AddressType.Restricted:
                return "Restricted";
            default:
                return "Unknown";
        }
    }

    /**
     * Get the name for the unlock type.
     * @param type The type to get the name for.
     * @returns The unlock type name.
     */
    public static getUnlockTypeName(type: number): string {
        switch (type) {
            case UnlockType.Signature: {
                return "Signature Unlock";
            }
            case UnlockType.Reference: {
                return "Reference Unlock";
            }
            case UnlockType.Account: {
                return "Account Unlock";
            }
            case UnlockType.Anchor: {
                return "Anchor Unlock";
            }
            case UnlockType.Nft: {
                return "NFT Unlock";
            }
            case UnlockType.Empty: {
                return "Empty Unlock";
            }
            default: {
                return "Unknown Unlock";
            }
        }
    }

    /**
     * Compute a payload type string from block.
     * @param block The block data.
     * @returns The payload type string.
     */
    public static getPayloadType(type: number): string {
        let payloadType = "-";

        switch (type) {
            case PayloadType.TaggedData: {
                payloadType = "Data";
                break;
            }
            case PayloadType.SignedTransaction: {
                payloadType = "Transaction";
                break;
            }
            case PayloadType.CandidacyAnnouncement: {
                payloadType = "Candidacy Announcement";
                break;
            }
            default: {
                break;
            }
        }

        return payloadType;
    }

    /**
     * Get the name for the output type.
     * @param type The type to get the name for.
     * @returns The output type name.
     */
    public static getOutputTypeName(type: OutputType): string {
        switch (type) {
            case OutputType.Basic:
                return "Basic";
            case OutputType.Account:
                return "Account";
            case OutputType.Anchor:
                return "Anchor";
            case OutputType.Foundry:
                return "Foundry";
            case OutputType.Nft:
                return "Nft";
            case OutputType.Delegation:
                return "Delegation";
            default:
                return "Unknown Output";
        }
    }
    /**
     * Get the name for the feature type.
     * @param type The type to get the name for.
     * @param isImmutable Whether the feature is immutable or not.
     * @returns The feature type name.
     */
    public static getFeatureTypeName(type: FeatureType, isImmutable: boolean): string {
        let name: string = "";

        switch (type) {
            case FeatureType.Sender:
                name = "Sender";
                break;
            case FeatureType.Issuer:
                name = "Issuer";
                break;
            case FeatureType.Metadata:
                name = "Metadata";
                break;
            case FeatureType.StateMetadata:
                name = "State Metadata";
                break;
            case FeatureType.Tag:
                name = "Tag";
                break;
            case FeatureType.NativeToken:
                name = "Native Token";
                break;
            case FeatureType.BlockIssuer:
                name = "Block Issuer";
                break;
            case FeatureType.Staking:
                name = "Staking";
                break;
        }

        if (name) {
            return isImmutable ? `Immutable ${name}` : name;
        }

        return "Unknown Feature";
    }
}
