
export interface IConfiguration {
    /**
     * The api endpoint for the client.
     */
    apiEndpoint: string;

    /**
     * The google analytics id.
     */
    googleAnalyticsId: string;

    /**
     * If Identity Resolver tool should be supported.
     */
    identityResolverEnabled: boolean;
}
