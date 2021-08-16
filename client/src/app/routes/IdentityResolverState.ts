import { IMessageMetadata } from "@iota/iota.js";
import { IIdentityDidResolveResponse } from "../../models/api/IIdentityResolveResponse";
import { MessageTangleStatus } from "../../models/messageTangleStatus";

export interface IdentityResolverState {
    identityResolved: boolean;
    resolvedIdentity: IIdentityDidResolveResponse | undefined;
    did: string | undefined;
    error: boolean;
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
