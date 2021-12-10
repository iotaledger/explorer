import { IIdentityDiffHistoryResponse } from "../../../../models/api/IIdentityDiffHistoryResponse";

export interface IdentityTreeItemState {
    // If children of current integration message are shown.
    hasChildren: boolean;

    // If loading diff history of current integration message is in progress.
    loadingChildren: boolean;

    // the response of diff history request.
    diffHistory?: IIdentityDiffHistoryResponse;

    // Error message if resolve diff history includes it. otherwise undefined.
    error: string | undefined;
}
