import { IResponse } from "../../IResponse";
import { ILatestDocument } from "./IIdentityLatestDocument";

export interface IIdentityDidResolveResponse extends IResponse{

    /**
     * message id of resolved DID
     */
    messageId?: string;

    /**
     * Resolved DID Document
     */
    document?: ILatestDocument;

    /**
     * version of DID implementation
     */
    version?: string;

    error?: string;
}
