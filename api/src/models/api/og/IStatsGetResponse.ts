import { IResponse } from "../IResponse";

export interface IStatsGetResponse extends IResponse {
    /**
     * The items per second.
     */
    itemsPerSecond?: number;
    /**
     * The confirmed items per second.
     */
    confirmedItemsPerSecond?: number;
    /**
     * The confirmed rate.
     */
    confirmationRate?: number;
}
