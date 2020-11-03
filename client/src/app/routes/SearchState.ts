import { ProtocolVersion } from "../../models/db/protocolVersion";

export interface SearchState {
    /**
     * The version of the protocol.
     */
    protocolVersion: ProtocolVersion;

    /**
     * Is the component busy.
     */
    statusBusy: boolean;

    /**
     * The status message to display.
     */
    status: string;

    /**
     * Is this an error.
     */
    completion: string;

    /**
     * Is this an error.
     */
    invalidError: string;

    /**
     * Redirect to another page.
     */
    redirect: string;
}
