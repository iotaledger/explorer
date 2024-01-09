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
