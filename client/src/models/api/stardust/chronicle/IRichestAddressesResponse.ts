import { IResponse } from "../../IResponse";

interface IRichAddress {
    address: { type: number; pubKeyHash: string }[];
}

export interface IRichestAddressesResponse extends IResponse {
    top?: IRichAddress[];
    ledgerIndex?: number;
}

