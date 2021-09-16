export interface IIdentityDidHistoryResponse {
    integrationChainData?: IntegrationChainData[];
    diffChainData?: unknown[];
    diffChainSpam?: string[];
    integrationChainSpam?: string[];
    error?: string;
}

export interface IntegrationChainData {
    document: IntegrationDocument;
    messageId: string;
}

export interface IntegrationDocument {
    created?: string;
    updated?: string;
}
