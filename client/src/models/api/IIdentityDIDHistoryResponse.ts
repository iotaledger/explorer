export interface IIdentityDIDHistoryResponse {
    integrationChainData?: IntegrationChainData[];
    diffChainData?: unknown[];
    diffChainSpam?: string[];
    integrationChainSpam?: string[];
    error?: string;
}

interface IntegrationChainData{
    document: unknown;
    messageId: string;
}