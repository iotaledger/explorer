import { IBlock, IBlockMetadata, ISignatureUnlock, IUTXOInput } from "@iota/iota.js-stardust";
import { IInput } from "../../../models/api/stardust/IInput";
import { IOutput } from "../../../models/api/stardust/IOutput";
import { TangleStatus } from "../../../models/tangleStatus";

export interface BlockState {
    /**
     * The transaction id.
     */
    transactionId?: string;

    /**
     * Block.
     */
    block?: IBlock;

    /**
     * The block fetching failed.
     */
    blockError?: string;

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
     * The state of the block on the tangle.
     */
    blockTangleStatus: TangleStatus;

    /**
     * Display advanced mode.
     */
    advancedMode: boolean;

    /**
     * The inputs of the transaction
     */
    inputs?: (IUTXOInput & IInput)[];

    /**
     * The unlocks of the transaction.
     */
    unlocks?: ISignatureUnlock[];

    /**
     * The outputs.
     */
    outputs?: IOutput[];

    /**
     * The total of the transfer excluding remainders.
     */
    transferTotal?: number;

    /**
     * Format the amount in full.
     */
    isFormattedBalance: boolean;
}
