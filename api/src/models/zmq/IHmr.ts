/**
 * The ratio of received transactions that the IRI stored in cache to received transaction
 * that the IRI randomly removed (hit to miss ratio).
 */
export interface IHmr {
    /**
     * Hit Count.
     */
    hitCount: number;

    /**
     * Miss Count.
     */
    missCount: number;
}
