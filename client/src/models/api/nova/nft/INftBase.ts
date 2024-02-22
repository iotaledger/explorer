import { MetadataFeature } from "@iota/sdk-wasm-nova/web";

export interface INftBase {
    /**
     * The hex NftId of this NFT
     */
    nftId: string;
    /**
     * The hex id of the immutable issuer.
     */
    issuerId: string | null;
    /**
     * NFT Metadata
     */
    metadata: MetadataFeature | null;
}
