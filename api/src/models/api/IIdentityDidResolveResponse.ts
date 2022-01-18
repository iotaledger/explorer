import { ILatestDocument } from "./IIdentityLatestDocument";
import { IResponse } from "./IResponse";

export interface IIdentityDidResolveResponse extends IResponse{

    /**
     * message id of resolved DID
     */
    messageId?: string;

    /**
     * Resolved DID Document
     */
    document?: ILatestDocument;

    version?: string;

    error?: string;
}
