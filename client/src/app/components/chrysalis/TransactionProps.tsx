import { IOutputResponse } from "@iota/iota.js";

export interface TransactionProps {
    /**
     * The output.
     */
    output: IOutputResponse;
    /**
     * The network to lookup.
     */
    network: string;
    /**
     * The filter value.
     */
    filterValue: "all" | "incoming" | "outgoing";

    /**
     * The received amount handler.
     */
    receivedAmountHandler(amount: number): void;
}
