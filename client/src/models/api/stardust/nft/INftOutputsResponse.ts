import { IOutputsResponse } from "@iota/sdk-wasm/web";
import { IResponse } from "../../IResponse";

export interface INftOutputsResponse extends IResponse {
  /**
   * The output data.
   */
  outputs?: IOutputsResponse;
}
