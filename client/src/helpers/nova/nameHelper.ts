import { PayloadType, UnlockType } from "@iota/sdk-wasm-nova/web";

export class NameHelper {
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
}
