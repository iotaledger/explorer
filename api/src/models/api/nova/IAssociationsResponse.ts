import { IResponse } from "../IResponse";

export enum AssociationType {
    BASIC_ADDRESS,
    BASIC_ADDRESS_EXPIRED,
    BASIC_STORAGE_RETURN,
    BASIC_EXPIRATION_RETURN,
    BASIC_SENDER,
    ACCOUNT_ADDRESS,
    ACCOUNT_ISSUER,
    ACCOUNT_SENDER,
    ACCOUNT_ID,
    ANCHOR_ID,
    ANCHOR_STATE_CONTROLLER,
    ANCHOR_GOVERNOR,
    ANCHOR_ISSUER,
    ANCHOR_SENDER,
    DELEGATION_ADDRESS,
    DELEGATION_VALIDATOR,
    FOUNDRY_ACCOUNT,
    NFT_ADDRESS,
    NFT_ADDRESS_EXPIRED,
    NFT_STORAGE_RETURN,
    NFT_EXPIRATION_RETURN,
    NFT_ISSUER,
    NFT_SENDER,
    NFT_ID,
}

export interface IAssociation {
    /**
     * The association for the output ids.
     */
    type: AssociationType;
    /**
     * The output ids for the association.
     */
    outputIds: string[];
}

export interface IAssociationsResponse extends IResponse {
    /**
     * The associations to output ids.
     */
    associations?: IAssociation[];
}
