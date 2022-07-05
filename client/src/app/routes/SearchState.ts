import { ProtocolVersion } from "../../models/config/protocolVersion";

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

    /**
     * State to pass to redirected page.
     */
    redirectState?: string[];
}
