import { OutputResponse } from "@iota/sdk";
import { IResponse } from "../IResponse";

export interface IFoundryResponse extends IResponse {
  /**
   * The foundry details response.
   */
  foundryDetails?: OutputResponse;
}
