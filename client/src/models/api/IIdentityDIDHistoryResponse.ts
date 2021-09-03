export interface IIdentityDIDHistoryResponse {
    integrationChainData?: IntegrationChainData[];
    diffChainData?: unknown[];
    diffChainSpam?: string[];
    integrationChainSpam?: string[];
    error?: string;
}

interface IntegrationChainData {
    document: {
        created: string;
    };
    messageId: string;
}
