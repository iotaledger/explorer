import { HexEncodedString } from "@iota/sdk-wasm-stardust/web";

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
    metadata: HexEncodedString | null;
}
