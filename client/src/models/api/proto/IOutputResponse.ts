import { IOutput } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface IOutputResponse extends IResponse {
    output?: IOutput;
}
