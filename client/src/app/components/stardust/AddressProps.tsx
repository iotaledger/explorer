import { AddressTypes } from "@iota/iota.js-stardust";
import * as H from "history";

export interface AddressProps {
    /**
     * The address.
     */
    address: AddressTypes;
    /**
     * Network
     */
    network: string;

    /**
     * History for navigation.
     */
    history: H.History;
}
