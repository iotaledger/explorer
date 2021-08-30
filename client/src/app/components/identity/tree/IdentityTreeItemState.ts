import { IIdentityDiffHistoryResponse } from "../../../../models/api/IIdentityDiffHistoryResponse";

export interface IdentityTreeItemState {
    hasChildren: boolean;
    loadingChildren: boolean;
    isSelected: boolean;
    diffHistory?: IIdentityDiffHistoryResponse;
}
