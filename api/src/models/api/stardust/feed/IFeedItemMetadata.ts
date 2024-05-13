import { ConflictReason } from "@iota/sdk-stardust";

export interface IFeedItemMetadata {
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
