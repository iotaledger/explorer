import { IResponse } from "./IResponse";

export interface IIdentityDidResolveResponse extends IResponse{

    /**
     * message id of resolved DID
     */
    messageId?: string;

    /**
     * Resolved DID Document
     */
    document?: string;

    version?: string;

    error?: string;
}
