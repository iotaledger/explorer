import { IResponse } from "./IResponse";

export interface IGetMilestonesResponse extends IResponse {
    /**
     * The most recent milestones for the network.
     */
    milestones?: {
        /**
         * The transaction hash.
         */
        hash: string;
        /**
         * The milestone index.
         */
        milestoneIndex: number;
    }[];
}
