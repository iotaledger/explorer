import { INftBase } from "~models/api/stardust/nft/INftBase";

export interface NftProps {
  /**
   * ID of a NFT
   */
  nft: INftBase;
  /**
   * The context networkId
   */
  network: string;
}
