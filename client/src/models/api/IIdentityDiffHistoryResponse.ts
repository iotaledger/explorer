import { IIdentityMessageWrapper } from "./../identity/IIdentityMessageWrapper";

export interface IIdentityDiffHistoryResponse {
    chainData: IIdentityMessageWrapper[];
    spam: string[];
    error?: string;
}
export interface DiffMessage {
    diff: unknown;
    created: string;
    updated: string;
}

