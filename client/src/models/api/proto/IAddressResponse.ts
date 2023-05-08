import { IAddress, IOutput } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface IAddressResponse extends IResponse {
    address?: IAddress;
    unspentOutputs?: IOutput[];
    spentOutputs?: IOutput[];
}

