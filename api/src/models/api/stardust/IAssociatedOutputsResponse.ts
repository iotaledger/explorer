import { IResponse } from "../IResponse";


export enum AssociationType {
    BASIC_ADDRESS,
    BASIC_SENDER,
    BASIC_EXPIRATION_RETURN,
    BASIC_STORAGE_RETURN,
    ALIAS_STATE_CONTROLLER,
    ALIAS_GOVERNOR,
    ALIAS_ISSUER,
    ALIAS_SENDER,
    ALIAS_ID,
    FOUNDRY_ALIAS,
    NFT_ADDRESS,
    NFT_STORAGE_RETURN,
    NFT_EXPIRATION_RETURN,
    NFT_SENDER,
    NFT_ID
}

export interface IAssociatedOutput {
    /**
     * The associations for the output
     */
    associations: AssociationType[];
    /**
     * The associated output.
     */
    outputId: string;
}

export interface IAssociatedOutputsResponse extends IResponse {
    /**
     * The associated outputs.
     */
    outputs?: IAssociatedOutput[];
}

/**
 * Helper map to sort associations by importance to render on client.
 * Greater has more priority.
 */
export const ASSOCIATION_TYPE_TO_PRORITY = {
    [AssociationType.BASIC_ADDRESS]: 1,
    [AssociationType.BASIC_SENDER]: 4,
    [AssociationType.BASIC_EXPIRATION_RETURN]: 3,
    [AssociationType.BASIC_STORAGE_RETURN]: 2,
    [AssociationType.ALIAS_ID]: 1,
    [AssociationType.ALIAS_STATE_CONTROLLER]: 2,
    [AssociationType.ALIAS_GOVERNOR]: 3,
    [AssociationType.ALIAS_ISSUER]: 4,
    [AssociationType.ALIAS_SENDER]: 5,
    [AssociationType.FOUNDRY_ALIAS]: 1,
    [AssociationType.NFT_ID]: 4,
    [AssociationType.NFT_ADDRESS]: 1,
    [AssociationType.NFT_STORAGE_RETURN]: 2,
    [AssociationType.NFT_EXPIRATION_RETURN]: 3,
    [AssociationType.NFT_SENDER]: 5
};

