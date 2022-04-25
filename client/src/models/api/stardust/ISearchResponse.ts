import { IMessage, IMilestoneResponse, IOutputResponse, IOutputsResponse } from "@iota/iota.js-stardust";
import { IResponse } from "../IResponse";
import IAddressDetails from "./IAddressDetails";
import { ITransactionsDetailsResponse } from "./ITransactionsDetailsResponse";

export interface ISearchResponse extends IResponse {
    /**
     * Message if it was found.
     */
    message?: IMessage;

    /**
     * Message ids if indexation was found.
     */
    indexMessageIds?: string[];

    /**
     * Index type if result from indexation.
     */
    indexMessageType?: "utf8" | "hex" | undefined;

    /**
     * Address if it was found.
     */
    address?: string;

    /**
     * Address details when address was found.
     */
    addressDetails?: IAddressDetails;

    /**
     * Output ids when address was found.
     */
    addressOutputIds?: string[];

    /**
     * Historic output ids when address was found from permanode.
     */
    historicAddressOutputIds?: string[];

    /**
     * Output if it was found (message will also be populated).
     */
    output?: IOutputResponse;

    /**
     * Outputs if they were found.
     */
    outputs?: IOutputsResponse;

    /**
     * Milestone if it was found.
     */
    milestone?: IMilestoneResponse;

    /**
     * The included message id.
     */
    includedMessageId?: string;

    /**
     * Cursor to use for subsequent requests.
     */
    cursor?: string;

    /**
     * Transactions of an address.
     */
    transactionHistory?: ITransactionsDetailsResponse;
    /**
     * DiD identifier.
     */
    did?: string;
}

