import { ILatestDocument } from "./IIdentityLatestDocument";

export type IIdentityDiffHistoryBody = ILatestDocument & {
    version: string;
};
