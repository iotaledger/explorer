import { INodeInfoBaseToken, IRent } from "@iota/sdk-wasm-stardust/web";
import { createContext } from "react";
import { IOTA_UI } from "~models/config/uiTheme";

/**
 * The network context object.
 */
interface INetworkContextProps {
    /**
     * The network name.
     */
    name: string;
    /**
     * The base token info of the node.
     */
    tokenInfo: INodeInfoBaseToken;
    /**
     * The protocol version running on the node.
     */
    protocolVersion: number;
    /**
     * The bech32 human readable part used in the network.
     */
    bech32Hrp: string;
    /**
     * The rent structure of the network.
     */
    rentStructure: IRent;
    /**
     * The UI theme to use.
     */
    uiTheme: string;
}

const defaultState = {
    name: "",
    tokenInfo: {
        name: "",
        tickerSymbol: "",
        unit: "",
        decimals: 0,
        subunit: undefined,
        useMetricPrefix: true,
    },
    bech32Hrp: "",
    protocolVersion: -1,
    rentStructure: {
        vByteCost: -1,
        vByteFactorData: -1,
        vByteFactorKey: -1,
    },
    uiTheme: IOTA_UI,
};

const networkContext = createContext<INetworkContextProps>(defaultState);

export default networkContext;
