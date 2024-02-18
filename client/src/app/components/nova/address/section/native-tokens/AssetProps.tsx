import { NativeToken } from "@iota/sdk-wasm-nova/web";

export interface AssetProps {
    /**
     * Token
     */
    token: NativeToken;

    /**
     * True if the asset is rendered like a table
     */
    tableFormat?: boolean;
}
