import { ISlot } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface ISlotResponse extends IResponse {
    slot?: ISlot;
}

