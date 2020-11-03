import { IResponse } from "./IResponse";

export interface IMilestonesGetResponse extends IResponse {
    /**
     * The most recent milestones for the network.
     */
    milestones?: {
        /**
         * The transaction or milestone hash.
         */
        hash: string;

        /**
         * The milestone index.
         */
        milestoneIndex: number;
    }[];
}
