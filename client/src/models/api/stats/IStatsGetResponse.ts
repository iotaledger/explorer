import { IStatistics } from "../../services/IStatistics";
import { IResponse } from "../IResponse";
import { ISignedResponse } from "../ISignedResponse";

export interface IStatsGetResponse extends IStatistics, IResponse, ISignedResponse {
    /**
     * The health of the network 0=bad, 1=degraded, 2=good
     */
    health?: number;

    /**
     * The reason for the heslth status
     */
    healthReason?: string;

    /**
     * Statistics history.
     */
    itemsPerSecondHistory?: number[];
}
