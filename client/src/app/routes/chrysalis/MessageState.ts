import { IMessage, IMessageMetadata, IUTXOInput } from "@iota/iota.js";
import { IBech32AddressDetails } from "../../../models/api/IBech32AddressDetails";
import { TangleStatus } from "../../../models/tangleStatus";

export interface MessageState {
    /**
     * The actual message Id in the case of an included message.
     */
    actualMessageId?: string;

    /**
     * The transaction id.
     */
    transactionId?: string;

    /**
     * Message.
     */
    message?: IMessage;

    /**
     * Metadata.
     */
    metadata?: IMessageMetadata;

    /**
     * The metadata failed.
     */
    metadataError?: string;

    /**
     * Reason for the conflict.
     */
    conflictReason?: string;

    /**
     * Are we busy loading the children.
     */
    childrenBusy: boolean;

    /**
     * The children ids.
     */
    childrenIds?: string[];

    /**
     * The state of the message on the tangle.
     */
    messageTangleStatus: TangleStatus;

    /**
     * Display advanced mode.
     */
    advancedMode: boolean;

    /**
     * The unlock addresses for the transactions.
     */
    inputs?: (IUTXOInput & {
        outputHash: string;
        isGenesis: boolean;
        transactionUrl: string;
        transactionAddress: IBech32AddressDetails;
        signature: string;
        publicKey: string;
        amount: number;
    })[];

    /**
     * The outputs.
     */
    outputs?: {
        index: number;
        type: number;
        address: IBech32AddressDetails;
        amount: number;
        isRemainder: boolean;
    }[];

    /**
     * The total of the transfer excluding remainders.
     */
    transferTotal?: number;

    /**
     * The unlock addresses for the transactions.
     */
    unlockAddresses?: IBech32AddressDetails[];
}
