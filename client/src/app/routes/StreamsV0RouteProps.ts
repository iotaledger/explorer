import { MamMode } from "@iota/mam.js";

export interface StreamsV0RouteProps {
    /**
     * The network mam channel details to lookup.
     */
    network: string;

    /**
     * The mam channel details to lookup.
     */
    hash?: string;

    /**
     * The mode for the mam channel.
     */
    mode?: MamMode;

    /**
     * The sideKey for the mam channel.
     */
    key?: string;
}
