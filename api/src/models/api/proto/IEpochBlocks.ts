import { IEpochBlocks } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface IEpochBlocksReponse extends IResponse {
    blocks?: IEpochBlocks;
}
