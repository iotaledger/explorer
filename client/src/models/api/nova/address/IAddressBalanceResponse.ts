import { IResponse } from "../../IResponse";

export interface IManaBalance {
    stored: number;
    decay: number;
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
     * The balance of trivialy unlockable outputs with address unlock condition.
     */
    availableBalance?: IBalance;

    /**
     * The ledger index at which this balance data was valid.
     */
    ledgerIndex?: number;
}
