export interface IIdentityDiffHistoryResponse {
    chainData: { messageId: string; message: DiffMessage; document: DiffDocument }[];
    spam: string[];
    error?: string;
}
export interface DiffMessage {
    diff: unknown;
    created: string;
    updated: string;
}

export interface DiffDocument {
    created: string;
    updated: string;
}
