import { IIdentityDIDHistoryResponse } from "../../../../models/api/IIdentityDIDHistoryResponse";

export interface IdentityTreeProps {
    network: string;
    history?: IIdentityDIDHistoryResponse | undefined;

    onItemClick(messageId: string, content: unknown): void;
}
