export interface ILatestMilestone {
    /**
     * The hash.
     */
    id?: string;

    /**
     * Metadata for the item.
     */
    properties?: {
        milestoneId: string;
        index: number;
        timestamp: number;
    };
}

export interface ILatestMilestones {
    /**
     * Array of latest milestones.
     */
    milestones?: ILatestMilestone[];
}
