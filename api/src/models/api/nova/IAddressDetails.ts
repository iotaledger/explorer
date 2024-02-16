/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { AddressType } from "@iota/sdk-nova";

export interface IAddressDetails {
    bech32: string;
    hex?: string;
    type?: AddressType;
    label?: string;
    capabilities?: number[];
}
