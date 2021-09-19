import { IIdentityDidHistoryResponse } from "../../../models/api/IIdentityDidHistoryResponse";

export interface IdentityHistoryState {

    // if history data are already loaded from Server.
    historyLoaded: boolean;

    // MessageId of the selected item of the tree.
    selectedMessageId?: string;

    // The history data if resolved from Server.
    resolvedHistory?: IIdentityDidHistoryResponse | undefined;

    // The content of the selected integration of diff message.
    contentOfSelectedMessage: { document: unknown; message: unknown };

    // if history request is in progress.
    loadingHistory: boolean;

    // if error during history resolution.
    error: string | undefined;

    compareWith: { messageId: string; content: { document: unknown; message: unknown } }[];

    selectedComparedMessageId?: string;
    selectedComparedContent?: { document: unknown; message: unknown };
}
