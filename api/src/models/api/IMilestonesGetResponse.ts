import { IResponse } from "./IResponse";

export interface IMilestonesGetResponse extends IResponse {
    /**
     * The most recent milestones for the network.
     */
    milestones?: {
        /**
         * The transaction hash or milestone message id.
         */
        id: string;

        /**
         * The milestone index.
         */
        milestoneIndex: number;

        /**
         * The milestone timestamp.
         */
        timestamp: number;
    }[];
}
