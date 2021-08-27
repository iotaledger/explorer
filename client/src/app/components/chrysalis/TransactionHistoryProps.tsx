import { IOutputResponse } from "@iota/iota.js";
import * as H from "history";

export interface TransactionHistoryProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The output to display.
     */
    outputs: IOutputResponse[] | undefined;
}
