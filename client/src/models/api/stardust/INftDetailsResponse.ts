import { IResponse } from "../IResponse";

export interface INftActivityHistory {
    /**
     * transaction id
     */
    transactionId: string;
    /**
     * The date of transaction
     */
    date: string;
    /**
     * The action of transaction
     */
    action: string;
    /**
     * The status of transaction
     */
    status: string;
    /**
     * The price of transaction
     */
    price: string;
}

export interface INftGeneral {
    /**
     * token standard
     */
    standard: string;
    /**
     * token Id
     */
    tokenId: string;
    /**
     * nft contract address
     */
    contractAddress: string;
    /**
     * nft creator address
     */
    creatorAddress: string;
    /**
     * nft sender address
     */
    senderAddress: string;
    /**
     * nft file type
     */
    fileType: string;
    /**
     * network
     */
    network: string;
}

export interface INftDetailsResponse extends IResponse {
    /**
     * Nft image url
     */
     imageSrc?: string;
     /**
      * Nft amount
      */
     amount?: number;
     /**
      * Nft quantity
      */
     quantity?: number;
     /**
      * Nft general information
      */
     generalData?: INftGeneral;
     /**
      * Nft activity history
      */
     activityHistory: INftActivityHistory[];
}
