export interface IStatsGetRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * Include a history.
     */
    includeHistory?: boolean;
}
