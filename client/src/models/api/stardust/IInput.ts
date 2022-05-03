import { IBech32AddressDetails } from "../../IBech32AddressDetails";

export interface IInput {
    /**
     * The output hash.
     */
    outputHash: string;
    /**
     * The is genesis flag.
     */
    isGenesis: boolean;
    /**
     * The transaction URL.
     */
    transactionUrl: string;
    /**
     * The transaction address details.
     */
    transactionAddress: IBech32AddressDetails;
    /**
     * The signature.
     */
    signature: string;
    /**
     * The public key.
     */
    publicKey: string;
    /**
     * The amount.
     */
    amount: number;
}
