import { ConflictReason } from "@iota/iota.js-stardust";

export interface IFeedItemMetadata {
    /**
     * Is the item a milestone.
     */
    milestone?: number;

    /**
     * Is the item confirmed, only applies to OG.
     */
    confirmed?: number;

    /**
     * Is the item referenced, only applies to Stardust.
     */
    referenced?: number;

    /**
     * Is the item solid, only applies to Stardust.
     */
    solid?: boolean;

    /**
     * Is the item conflicting, only applies to Stardust.
     */
    conflicting?: boolean;

    /**
     * The conflict reason.
     */
    conflictReason?: ConflictReason;

    /**
     * Is the item included, only applies to Stardust.
     */
    included?: boolean;
}
