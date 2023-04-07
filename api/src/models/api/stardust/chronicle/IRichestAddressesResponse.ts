import { IResponse } from "@iota/iota.js-stardust";

export interface IRichAddress {
    address: string;
    balance: string;
}

export interface IRichestAddressesResponse extends IResponse {
    top?: IRichAddress[];
    ledgerIndex?: number;
}

