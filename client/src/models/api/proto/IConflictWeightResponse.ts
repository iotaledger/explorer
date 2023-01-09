import { IConflictWeight } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface IConflictWeightResponse extends IResponse {
    conflict?: IConflictWeight;
}
