import { IAddressResponse as Origin } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface IAddressResponse extends IResponse {
    address?: Origin;
}

