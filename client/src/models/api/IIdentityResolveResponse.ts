import { IIdentityDocument } from "./../identity/IIdentityDocument";
import { IResponse } from "./IResponse";

export interface IIdentityDidResolveResponse extends IResponse{

    /**
     * message id of resolved DID
     */
    messageId?: string;

    /**
     * Resolved DID Document
     */
    document?: IIdentityDocument;

    version?: string;
}
