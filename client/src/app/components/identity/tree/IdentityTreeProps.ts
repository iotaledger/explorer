import { IIdentityDidHistoryResponse } from "~models/api/IIdentityDidHistoryResponse";
import { IIdentityMessageWrapper } from "~models/identity/IIdentityMessageWrapper";

export interface IdentityTreeProps {
    network: string;
    version: string;
    history?: IIdentityDidHistoryResponse | undefined;

    onItemClick(selectedItem: IIdentityMessageWrapper, compareWith?: IIdentityMessageWrapper[]): void;

    /**
     * triggered when new diff messages are loaded.
     */
    onDiffMessagesUpdate(): void;
}
