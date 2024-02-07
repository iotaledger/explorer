import { AddressType } from "@iota/sdk-nova";

export interface IAddressDetails {
    bech32: string;
    hex?: string;
    type?: AddressType;
    label?: string;
    restricted: boolean;
    capabilities?: boolean[];
}