import { IAddressResponse, IMessage, IMilestoneResponse, IOutputResponse } from "@iota/iota.js";
import { IResponse } from "../IResponse";

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
     * Address if it was found.
     */
    address?: IAddressResponse;

    /**
     * Output ids when address was found.
     */
    addressOutputIds?: string[];

    /**
     * Output if it was found (message will also be populated).
     */
    output?: IOutputResponse;

    /**
     * Milestone if it was found.
     */
    milestone?: IMilestoneResponse;
}
