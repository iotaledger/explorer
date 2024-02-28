import { IResponse } from "../../IResponse";

interface IManaBalance {
    stored: number;
    potential: number;
}

interface IBalance {
    amount: number;
    mana: IManaBalance;
}

export interface IAddressBalanceResponse extends IResponse {
    /**
     * The total balance (including Expiration, Timelock and StorageDepositReturn outputs)
     */
    totalBalance?: IBalance;

    /**
     * The balance of all spendable outputs by the address at this time.
     */
    availableBalance?: IBalance;

    /**
     * The ledger index at which this balance data was valid.
     */
    ledgerIndex?: number;
}
