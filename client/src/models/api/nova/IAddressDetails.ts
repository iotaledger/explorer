import { AddressType } from "@iota/sdk-wasm-nova/web";

export interface IAddressDetails {
    bech32: string;
    hex?: string;
    type?: AddressType;
    label?: string;
    restricted?: boolean;
    capabilities?: number[];
}
