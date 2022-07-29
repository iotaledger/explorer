import { INodeInfoBaseToken } from "@iota/iota.js-stardust";

interface INodeAndTokenInfo {
    baseToken: INodeInfoBaseToken;
    protocolVersion: number;
    bech32Hrp: string;
}

/**
 * Interface definition for a node service.
 */
export interface INodeService {
    /**
     * Get the base token info.
     */
    getNodeAndTokenInfo(): INodeAndTokenInfo;
}
