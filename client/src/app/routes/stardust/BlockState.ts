import { IBlock, IBlockMetadata, IUTXOInput } from "@iota/iota.js-stardust";
import { IBech32AddressDetails } from "../../../models/api/IBech32AddressDetails";
import { IInput } from "../../../models/api/stardust/IInput";
import { IOutput } from "../../../models/api/stardust/IOutput";
import { TangleStatus } from "../../../models/tangleStatus";

export interface BlockState {
    /**
     * The transaction id.
     */
    transactionId?: string;

    /**
     * The actual block Id in the case of an included block.
     */
    actualBlockId?: string;

    /**
     * Block.
     */
    block?: IBlock;

    /**
     * Metadata.
     */
    metadata?: IBlockMetadata;

    /**
     * The metadata failed.
     */
    metadataError?: string;

    /**
     * Reason for the conflict.
     */
    conflictReason?: string;

    /**
     * The state of the message on the tangle.
     */
    blockTangleStatus: TangleStatus;

    /**
     * Display advanced mode.
     */
    advancedMode: boolean;

    /**
     * The unlock addresses for the transactions.
     */
    inputs?: (IUTXOInput & IInput)[];

    /**
     * The outputs.
     */
    outputs?: IOutput[];

    /**
     * The total of the transfer excluding remainders.
     */
    transferTotal?: number;

    /**
     * The unlock addresses for the transactions.
     */
    unlockAddresses?: IBech32AddressDetails[];
}
