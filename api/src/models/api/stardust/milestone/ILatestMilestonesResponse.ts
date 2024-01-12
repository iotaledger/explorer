import { IResponse } from "../../IResponse";

export interface ILatestMilestone {
    /**
     * The block id.
     */
    blockId: string;

    /**
     * The milestone index.
     */
    index: number;

    /**
     * The milestone id.
     */
    milestoneId: string;

    /**
     * The milestone timestamp.
     */
    timestamp: number;
}

export interface ILatestMilestonesReponse extends IResponse {
    /**
     * The latest milestones.
     */
    milestones: ILatestMilestone[];
}

