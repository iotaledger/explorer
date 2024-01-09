export interface IIdentityDidHistoryResponse {
  integrationChainData?: unknown[];
  diffChainData?: unknown[];
  diffChainSpam?: string[];
  integrationChainSpam?: string[];
  error?: string;
}
