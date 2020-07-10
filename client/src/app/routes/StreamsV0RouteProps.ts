import { MamMode } from "@iota/mam.js";

export interface StreamsV0RouteProps {
    /**
     * The network channel details to lookup.
     */
    network: string;

    /**
     * The mam channel details to lookup.
     */
    hash?: string;

    /**
     * The mode for the channel.
     */
    mode?: MamMode;

    /**
     * The sideKey for the channel.
     */
    key?: string;
}
