import { IIdentityDidHistoryResponse } from "../../../../models/api/IIdentityDidHistoryResponse";

export interface IdentityTreeProps {
    network: string;
    history?: IIdentityDidHistoryResponse | undefined;

    onItemClick(messageId: string, content: unknown): void;
}
