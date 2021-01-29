import { IReceiptPayload } from "@iota/iota.js";

export interface ReceiptPayloadProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The receipt payload.
     */
    payload: IReceiptPayload;
}
