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
         * The id for the transaction or message.
         */
        id: string;

        /**
         * The milestone index.
         */
        milestoneIndex: number;
    }[];
}
