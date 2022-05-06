import { INodeInfoBaseToken } from "@iota/iota.js-stardust";
/**
 * Interface definition for a base token service.
 */
export interface IBaseTokenService {
    /**
     * Get the base token info.
     */
    getBaseTokenInfo(): INodeInfoBaseToken;
}
