export interface IIdentityDiffHistoryResponse {
    chainData?: { messageId: string; message: unknown }[];
    spam?: string[];
    error?: string;
}
