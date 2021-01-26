import { IStatistics } from "../../services/IStatistics";
import { IResponse } from "../IResponse";

export interface IStatsGetResponse extends IStatistics, IResponse {
    /**
     * The health of the network 0=bad, 1=degraded, 2=good
     */
    health?: number;
}
