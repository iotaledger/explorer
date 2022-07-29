import { INodeInfoBaseToken } from "@iota/iota.js-stardust";
import { createContext } from "react";
import { DEFAULT_NODE_INFO } from "../../services/nodeInfoService";

/**
 * The network context object.
 */
export interface INetworkContextProps {
    name: string;
    tokenInfo: INodeInfoBaseToken;
    bech32Hrp: string;
    protocolVersion: number;
}

const defaultState = {
  name: "",
  tokenInfo: DEFAULT_NODE_INFO.baseToken,
  bech32Hrp: DEFAULT_NODE_INFO.bech32Hrp,
  protocolVersion: DEFAULT_NODE_INFO.protocolVersion
};

const networkContext = createContext<INetworkContextProps>(defaultState);

export default networkContext;
