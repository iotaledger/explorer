import { IMessage, IMilestoneResponse, IOutputResponse } from "@iota/iota.js";
import { IResponse } from "../IResponse";
import IAddressDetails from "./IAddressDetails";

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
     * DiD identifier.
     */
    did?: string;
}
