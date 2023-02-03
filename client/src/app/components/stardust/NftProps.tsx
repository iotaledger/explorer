import { INftImmutableMetadata } from "../../../helpers/stardust/nftHelper";

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
    metadata: INftImmutableMetadata | undefined;
}
