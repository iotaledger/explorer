import { ISlotBlocks } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface ISlotBlocksReponse extends IResponse {
    blocks?: ISlotBlocks;
}
