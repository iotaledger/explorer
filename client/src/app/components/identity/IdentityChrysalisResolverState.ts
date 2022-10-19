import { IMessageMetadata } from "@iota/iota.js";
import { IIdentityDidHistoryResponse } from "../../../models/api/IIdentityDidHistoryResponse";
import { IIdentityDidResolveResponse } from "../../../models/api/IIdentityResolveResponse";
import { TangleStatus } from "../../../models/tangleStatus";

export interface IdentityChrysalisResolverState {
    /**
     * DID is already resolved in its document
     */
    isIdentityResolved: boolean;

    /**
     * The resolved DID document
     */
    resolvedIdentity: IIdentityDidResolveResponse | undefined;

    resolvedHistory: IIdentityDidHistoryResponse | undefined;

    historyError: boolean;

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
    messageTangleStatus: TangleStatus;

    /**
     * messageId of latest message. (zeros if latest message is a diff message)
     */
    latestMessageId?: string;

    /**
     * version of DID implementation
     */
    version?: string;
}
