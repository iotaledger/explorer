import { IResponse } from "./IResponse";
import { INetwork } from "../config/INetwork";

export interface INetworkGetResponse extends IResponse {
  /**
   * The list of available networks.
   */
  networks?: INetwork[];
}
