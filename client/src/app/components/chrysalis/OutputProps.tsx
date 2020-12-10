import { IOutputResponse } from "@iota/iota.js";
import * as H from "history";

export interface OutputProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The output id.
     */
    id: string;

    /**
     * The output to display.
     */
    output: IOutputResponse;

    /**
     * History for navigation.
     */
    history: H.History;
}
