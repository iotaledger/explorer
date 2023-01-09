import { IConflictConflicts } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface IConflictConflictsResponse extends IResponse {
    conflicts?: IConflictConflicts;
}
