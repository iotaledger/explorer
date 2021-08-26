import { IMessageMetadata } from "@iota/iota.js";
import { IIdentityDidResolveResponse } from "../../models/api/IIdentityResolveResponse";
import { MessageTangleStatus } from "../../models/messageTangleStatus";

export interface IdentityResolverState {
    /**
     * DID is already resolved in its document
     */
    isIdentityResolved: boolean;

    /**
     * The resolved DID document
     */
    resolvedIdentity: IIdentityDidResolveResponse | undefined;

    /**
     * The DID
     */
    did: string | undefined;

    /**
     * Error during resolving DID
     */
    error: boolean;

    /**
     * Error Message of Resolving DID
     */
    errorMessage: string;

    /**
     * Metadata of last message.
     */
    metadata?: IMessageMetadata;

    /**
     * The state of the message on the tangle.
     */
    messageTangleStatus: MessageTangleStatus;

    /**
     * an Example for a DID address
     */
    didExample?: string;
}
