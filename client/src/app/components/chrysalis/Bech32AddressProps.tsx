import * as H from "history";
import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";

export interface Bech32AddressProps {
    /**
     * The network to lookup.
     */
    network?: string;

    /**
     * History for navigation.
     */
    history?: H.History;

    /**
     * The address details.
     */
    addressDetails?: IBech32AddressDetails;
}
