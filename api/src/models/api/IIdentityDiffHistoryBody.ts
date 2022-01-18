import { ILatestDocument } from "./IIdentityLatestDocument";

export type IIdentityDiffHistoryBody = ILatestDocument & {
    /**
     * version of DID implementation
     */
    version: string;
};
