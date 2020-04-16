export interface IMilestoneStore {
    /**
     * The network the milestones are for.
     */
    network: string;

    /**
     * The milestone indexes.
     */
    indexes: {
        /**
         * The hash for the milestone.
         */
        hash: string;

        /**
         * The milestone index.
         */
        milestoneIndex: number;
    }[];
}
