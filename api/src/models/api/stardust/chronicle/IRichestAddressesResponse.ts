import { IResponse } from "@iota/sdk";

export interface IRichAddress {
  address: string;
  balance: string;
}

export interface IRichestAddressesResponse extends IResponse {
  top?: IRichAddress[];
  ledgerIndex?: number;
}
