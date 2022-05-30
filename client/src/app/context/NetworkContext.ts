import { INodeInfoBaseToken } from "@iota/iota.js-stardust";
import { createContext } from "react";
import { DEFAULT_BASE_TOKEN_INFO } from "../../services/baseTokenInfoService";

/**
 * The network context object.
 */
interface INetworkContextProps {
    name: string;
    tokenInfo: INodeInfoBaseToken;
    bech32Hrp: string;
}

const defaultState = {
  name: "",
  tokenInfo: DEFAULT_BASE_TOKEN_INFO,
  bech32Hrp: "iota"
};

const networkContext = createContext<INetworkContextProps>(defaultState);

export default networkContext;
