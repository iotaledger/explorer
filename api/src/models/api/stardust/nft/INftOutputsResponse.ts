import { IOutputsResponse } from "@iota/sdk";
import { IResponse } from "../../IResponse";

export interface INftOutputsResponse extends IResponse {
  /**
   * The output data.
   */
  outputs?: IOutputsResponse;
}
