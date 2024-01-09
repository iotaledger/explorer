export interface IIdentityDiffHistoryResponse {
  chainData?: { messageId: string; message: unknown; document: unknown }[];
  spam?: string[];
  error?: string;
}
