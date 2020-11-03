import { IAddress, IMessage, IMilestone, IOutput } from "@iota/iota2.js";
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
    address?: IAddress;

    /**
     * Output ids when address was found.
     */
    addressOutputIds?: string[];

    /**
     * Output if it was found (message will also be populated).
     */
    output?: IOutput;

    /**
     * Milestone if it was found.
     */
    milestone?: IMilestone;
}
