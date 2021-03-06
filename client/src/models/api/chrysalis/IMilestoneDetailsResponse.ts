import { IMilestoneResponse } from "@iota/iota.js";
import { IResponse } from "../IResponse";

export interface IMilestoneDetailsResponse extends IResponse {
    /**
     * The milestone data.
     */
    milestone?: IMilestoneResponse;
}
