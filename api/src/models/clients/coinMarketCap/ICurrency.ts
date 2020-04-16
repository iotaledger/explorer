/**
 * Representation of CoinMarketCap ticker response.
 */
export interface ICurrency {
    /**
     * Id for the currency.
     */
    id: number;
    /**
     * The name if the currency.
     */
    name: string;
    /**
     * The symbol for the currency.
     */
    symbol: string;
    /**
     * The circulating supply.
     */
    circulating_supply: number;
    /**
     * The total supply.
     */
    total_supply: number;
    /**
     * The max supply.
     */
    max_supply: number;
    /**
     * Date added.
     */
    date_added: string;
    /**
     * Number of market pairs.
     */
    num_market_pairs: number;
    /**
     * CMC Rank.
     */
    cmc_rank: number;
    /**
     * Last updated.
     */
    last_updated: string;
    /**
     * Tags.
     */
    tags: string[];
    /**
     * Platform.
     */
    platform: string;
    /**
     * Quote.
     */
    quote: {
        [id: string]: {
            /**
             * Price.
             */
            price: number;
            /**
             * Volume 24h.
             */
            volume_24h: number;
            /**
             * Percent change 1h.
             */
            percent_change_1h: number;
            /**
             * Percent change 24h.
             */
            percent_change_24h: number;
            /**
             * Percent change 7d.
             */
            percent_change_7d: number;
            /**
             * Market cap.
             */
            market_cap: number;
            /**
             * Last updated.
             */
            last_updated: string;
        };
    };
}
