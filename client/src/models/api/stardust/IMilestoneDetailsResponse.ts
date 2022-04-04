import { IMilestoneResponse } from "@iota/iota.js-stardust";
import { IResponse } from "../IResponse";

export interface IMilestoneDetailsResponse extends IResponse {
    /**
     * The milestone data.
     */
    milestone?: IMilestoneResponse;
}
