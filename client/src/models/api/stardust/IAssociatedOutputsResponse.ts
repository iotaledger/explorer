import { IOutputResponse } from "@iota/iota.js-stardust";
import { IResponse } from "../IResponse";

export enum AssociationType {
    BASIC_SENDER,
    BASIC_EXPIRATION_RETURN,
    BASIC_STORAGE_RETURN,
    ALIAS_STATE_CONTROLLER,
    ALIAS_GOVERNOR,
    ALIAS_ISSUER,
    ALIAS_SENDER,
    FOUNDRY_ALIAS,
    NFT_STORAGE_RETURN,
    NFT_EXPIRATION_RETURN,
    NFT_SENDER
}

export interface IAssociatedOutput {
    association: AssociationType;
    outputId: string;
    outputDetails?: IOutputResponse;
}

export interface IAssociatedOutputsResponse extends IResponse {
    /**
     * The associated outputs.
     */
    outputs?: IAssociatedOutput[];
}

