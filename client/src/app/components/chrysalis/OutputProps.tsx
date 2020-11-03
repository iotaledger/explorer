import { IOutput } from "@iota/iota2.js";
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
    output: IOutput;

    /**
     * History for navigation.
     */
    history: H.History;
}
