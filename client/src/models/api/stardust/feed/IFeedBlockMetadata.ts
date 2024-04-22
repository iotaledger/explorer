import { ConflictReason } from "@iota/sdk-wasm-stardust/web";

export interface IFeedBlockMetadata {
    /**
     * Is the item a milestone.
     */
    milestone?: number;

    /**
     * Timestamp of the milestone.
     */
    timestamp?: number;

    /**
     * Is the item referenced.
     */
    referenced?: number;

    /**
     * Is the item solid.
     */
    solid?: boolean;

    /**
     * Is the item conflicting.
     */
    conflicting?: boolean;

    /**
     * The conflict reason.
     */
    conflictReason?: ConflictReason;

    /**
     * Is the item included.
     */
    included?: boolean;
}
