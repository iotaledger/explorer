import { IBlock, IBlockMetadata, ISignatureUnlock, IUTXOInput } from "@iota/iota.js-stardust";
import { IInput } from "../../../models/api/stardust/IInput";
import { IOutput } from "../../../models/api/stardust/IOutput";
import { TangleStatus } from "../../../models/tangleStatus";

export interface TransactionPageState {
    /**
     * The network id.
     */
    tangleNetworkId?: string;

    /**
     * The commitment to the referenced inputs.
     */
    inputsCommitment?: string;

    /**
     * transaction included block.
     */
    block?: IBlock;

    /**
     * The block fetching failed.
     */
    blockError?: string;

    /**
     * The unlock addresses for the transactions.
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
     * The included block id
     */
    includedBlockId?: string;

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
     * Is formatted balance boolean.
     */
    isFormattedBalance: boolean;
}
