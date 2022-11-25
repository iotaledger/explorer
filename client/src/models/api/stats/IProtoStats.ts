import { IResponse } from "../IResponse";

/**
 * Compiled statistics about the prototype network.
 */
export interface IProtoStats {
    /**
     * The total amount of mana (active + inactive).
     */
    totalMana: number;
    /**
     * The current amount of active mana.
     */
    activeMana: number;
    /**
     * The amount of conflicts which got resolved in the last 24h.
     */
    conflictsResolved24h: number;
    /**
     * The amount of transactions which got booked in the last 24h.
     */
    txsBooked24h: number;
    /**
     * The amount of online nodes in the network.
     */
    nodesOnline: number;
}

export interface IProtoStatsResponse extends IResponse {
    /**
     * The prototype network stats.
     */
    protoStats?: IProtoStats;
}
