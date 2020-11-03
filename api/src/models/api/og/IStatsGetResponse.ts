import { IResponse } from "../IResponse";

export interface IStatsGetResponse extends IResponse {
    /**
     * The transations per second.
     */
    tps: number;

    /**
     * The confirmed transations per second.
     */
    ctps: number;

    /**
     * The confirmed rate.
     */
    confirmationRate: number;
}
