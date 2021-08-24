import { IIdentityDIDHistoryResponse } from "../../../models/api/IIdentityDIDHistoryResponse";

export interface IdentityHistoryState {
    historyLoaded: boolean;
    selectedMessageId?: string;
    resolvedHistory?: IIdentityDIDHistoryResponse | undefined;
    contentOfSelectedMessage?: unknown;
}
