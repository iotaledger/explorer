import { IResponse } from "../../IResponse";

export interface IMilestoneBlocksResponse extends IResponse {
    /**
     * The block ids this milestone confirms.
     */
    blocks?: string[];

    /**
     * The cursor for paginating.
     */
    cursor?: string;
}
