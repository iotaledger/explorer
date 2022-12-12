import { IEpochVotersWeight } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface IEpochVotersWeightResponse extends IResponse {
    voters?: IEpochVotersWeight;
}
