import { IIdentityDidHistoryResponse } from "../../../../models/api/IIdentityDidHistoryResponse";
import { IIdentityMessageWrapper } from "../../../../models/identity/IIdentityMessageWrapper";

export interface IdentityTreeProps {
    network: string;
    history?: IIdentityDidHistoryResponse | undefined;

    onItemClick(selectedItem: IIdentityMessageWrapper, compareWith?: IIdentityMessageWrapper[]): void;

    /**
     * update the messages to compare with of the selected message.
     */
    updateCompareWith(): void;
}
