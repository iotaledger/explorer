export interface IIdentityDidHistoryResponse {
    integrationChainData?: IntegrationChainData[];
    diffChainData?: unknown[];
    diffChainSpam?: string[];
    integrationChainSpam?: string[];
    error?: string;
}

export interface IntegrationChainData {
    document: IntegrationMessage;
    messageId: string;
}

export interface IntegrationMessage {
    created?: string;
    updated?: string;
    previousMessageId?: string;
    proof?: string;
}
