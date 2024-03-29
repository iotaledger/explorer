import { AddressType } from "@iota/sdk-wasm-nova/web";

export interface IAddressDetails {
    bech32: string;
    hex?: string;
    type?: AddressType;
    label?: string;
    restricted?: IRestrictedAddressDetails;
}

export interface IRestrictedAddressDetails {
    bech32: string;
    innerAddressType?: AddressType;
    capabilities?: number[];
}
