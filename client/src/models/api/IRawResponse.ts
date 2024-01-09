import { IResponse } from "./IResponse";

export interface IRawResponse extends IResponse {
  /**
   * The response.
   */
  raw?: Response;
}
