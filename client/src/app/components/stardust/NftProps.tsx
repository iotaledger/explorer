import { INftImmutableMetadata } from "../../../models/api/stardust/nft/INftImmutableMetadata";

export interface NftProps {
    /**
     * ID of a NFT
     */
    id: string;
    /**
     * The context networkId
     */
    network: string;
    /**
     * NFT Metadata
     */
    metadata?: INftImmutableMetadata;
}
