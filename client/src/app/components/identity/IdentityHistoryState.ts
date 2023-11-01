import { IIdentityMessageWrapper } from "./../../../models/identity/IIdentityMessageWrapper";
import { IIdentityDidHistoryResponse } from "../../../models/api/IIdentityDidHistoryResponse";

export interface IdentityHistoryState {

    /**
     * if history data are already loaded from Server.
     */
    historyLoaded: boolean;

    /**
     * The history data if resolved from Server.
     */
    resolvedHistory?: IIdentityDidHistoryResponse;

    /**
     * The selected integration or diff message.
     */
    selectedMessage?: IIdentityMessageWrapper;

    /**
     * if history request is in progress.
     */
    loadingHistory: boolean;

    /**
     * if error during history resolution.
     */
    error?: string;

    /**
     * list of messages that the current message can be compared with.
     */
    compareWith: IIdentityMessageWrapper[];

    /**
     * the message to be compared with if a compare message is selected.
     */
    selectedComparisonMessage?: IIdentityMessageWrapper;
}
