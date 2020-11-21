/**
 * Definition of configuration file.
 */
export interface IConfiguration {
    /**
     * API Endpoint or explorer.
     */
    explorerEndpoint: string;

    /**
     * The token for the bot.
     */
    discordToken: string;

    /**
     * API Key for Coin Market Cap.
     */
    coinMarketCapKey: string;
}
