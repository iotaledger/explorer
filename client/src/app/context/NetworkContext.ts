import { INodeInfoBaseToken } from "@iota/iota.js-stardust";
import { createContext } from "react";

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
     * The protocol version.
     */
    protocolVersion: number;
    /**
     * The version of node.
     */
    bech32Hrp: string;
}

const defaultState = {
  name: "",
  tokenInfo: {
      name: "",
      tickerSymbol: "",
      unit: "",
      decimals: 0,
      subunit: undefined,
      useMetricPrefix: true
  },
  bech32Hrp: "",
  protocolVersion: -1
};

const networkContext = createContext<INetworkContextProps>(defaultState);

export default networkContext;
