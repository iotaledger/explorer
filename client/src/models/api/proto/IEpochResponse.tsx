import { IEpoch } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface IEpochResponse extends IResponse {
    epoch: IEpoch;
}
