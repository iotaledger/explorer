import { IResponse } from "../../IResponse";

export interface IAddressBalanceResponse extends IResponse {
    /**
     * The total balance (including Expiration, Timelock and StorageDepositReturn outputs)
     */
    totalBalance?: number;

    /**
     * The balance of all spendable outputs by the address at this time.
     */
    availableBalance?: number;

    /**
     * The ledger index at which this balance data was valid.
     */
    ledgerIndex?: number;
}
