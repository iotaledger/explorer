import { IClientNetworkConfiguration } from "./IClientNetworkConfiguration";

export interface IConfiguration {
    /**
     * The networks.
     */
    networks: IClientNetworkConfiguration[];

    /**
     * The api endpoint for the client.
     */
    apiEndpoint: string;

    /**
     * The google analytics id.
     */
    googleAnalyticsId: string;
}
