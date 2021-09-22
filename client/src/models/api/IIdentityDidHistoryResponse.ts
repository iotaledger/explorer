export interface IIdentityDidHistoryResponse {
    integrationChainData?: IntegrationChainData[];
    diffChainData?: unknown[];
    diffChainSpam?: string[];
    integrationChainSpam?: string[];
    error?: string;
}

export interface IntegrationChainData {
    document: IdentityDocument;
    messageId: string;
}

export interface IdentityDocument {
    created?: string;
    updated?: string;
    previousMessageId?: string;
    proof?: string;
}
