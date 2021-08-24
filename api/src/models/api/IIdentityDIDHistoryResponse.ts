export interface IIdentityDIDHistoryResponse {
    integrationChainData?: unknown[];
    diffChainData?: unknown[];
    diffChainSpam?: string[];
    integrationChainSpam?: string[];
    error?: string;
}
