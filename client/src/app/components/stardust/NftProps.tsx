import { INftBase } from "./NftSection";

export interface NftProps {
    /**
     * ID of a NFT
     */
    nft: INftBase;
    /**
     * The context networkId
     */
    network: string;
}
