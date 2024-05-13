import { IResponse } from "../../IResponse";

export interface ISlotManaBurnedResponse extends IResponse {
    slotIndex?: number;
    manaBurned?: number;
}
