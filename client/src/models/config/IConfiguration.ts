
export interface IConfiguration {
    /**
     * The api endpoint for the client.
     */
    apiEndpoint: string;

    /**
     * The feed api endpoint for the client.
     */
    feedEndpoint?: string;

    /**
     * The google analytics id.
     */
    googleAnalyticsId: string;
}
