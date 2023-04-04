import { IResponse } from "@iota/iota.js-stardust";

interface IRichAddress {
    address: { type: number; pubKeyHash: string }[];
}

export interface IRichestAddressesResponse extends IResponse {
    top?: IRichAddress[];
    ledgerIndex?: number;
}

