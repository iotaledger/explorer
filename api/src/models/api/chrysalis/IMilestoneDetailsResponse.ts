import { IMilestoneResponse } from "@iota/iota.js-chrysalis";
import { IResponse } from "../IResponse";

export interface IMilestoneDetailsResponse extends IResponse {
  /**
   * The milestone data.
   */
  milestone?: IMilestoneResponse;
}
