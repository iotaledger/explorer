export interface IIdentityDiffHistoryResponse {
    chainData: { messageId: string; message: DiffMessage }[];
    spam: string[];
    error?: string;
}
export interface DiffMessage {
    diff: unknown;
    created: string;
}
