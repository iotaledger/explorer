export interface IIdentityDidHistoryResponse {
    integrationChainData?: IntegrationChainData[];
    diffChainData?: unknown[];
    diffChainSpam?: string[];
    integrationChainSpam?: string[];
    error?: string;
}

interface IntegrationChainData {
    document: {
        created: string;
        updated: string;
    };
    messageId: string;
}
