import { IConflictChildren } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface IConflictChildrenResponse extends IResponse {
    children?: IConflictChildren;
}
