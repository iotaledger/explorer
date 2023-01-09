import { IConflictVoters } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface IConflictVotersResponse extends IResponse {
    voters?: IConflictVoters;
}
