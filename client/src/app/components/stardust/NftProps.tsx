export interface NftProps {
    /**
     * ID of a NFT
     */
    id: string;
    /**
     * The name of a NFT
     */
    name?: string;
    /**
     * The image of a NFT.
     */
    image?: string;
    /**
     * The context networkId
     */
    network: string;
}
