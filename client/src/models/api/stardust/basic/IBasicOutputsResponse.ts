import { IOutputsResponse } from "@iota/sdk-wasm/web";
import { IResponse } from "../../IResponse";

export interface IBasicOutputsResponse extends IResponse {
  /**
   * The output data.
   */
  outputs?: IOutputsResponse;
}
