import { IResponse } from "../../IResponse";

export interface IAddressBalanceResponse extends IResponse {
  /**
   * The total balance (including Expiration, Timelock and StorageDepositReturn outputs)
   */
  totalBalance?: number;

  /**
   * The balance of trivialy unlockable outputs with address unlock condition.
   */
  sigLockedBalance?: number;

  /**
   * The ledger index at which this balance data was valid.
   */
  ledgerIndex?: number;
}
