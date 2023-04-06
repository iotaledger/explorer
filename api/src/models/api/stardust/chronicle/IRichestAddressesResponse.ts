import { IResponse } from "@iota/iota.js-stardust";

interface IRichAddress {
    address: string;
    balance: string;
}

export interface IRichestAddressesResponse extends IResponse {
    top?: IRichAddress[];
    ledgerIndex?: number;
}

