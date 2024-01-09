import { IOutputResponse } from "@iota/iota.js";
import { IResponse } from "../IResponse";

export interface IOutputDetailsResponse extends IResponse {
  /**
   * The output data.
   */
  output?: IOutputResponse;
}
