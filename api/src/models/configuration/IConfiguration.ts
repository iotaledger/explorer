import { IAWSDynamoDbConfiguration } from "./IAWSDynamoDbConfiguration";
import { INetworkConfiguration } from "./INetworkConfiguration";

/**
 * Definition of configuration file.
 */
export interface IConfiguration {
    /**
     * The networks.
     */
    networks: INetworkConfiguration[];

    /**
     * The coin market cap api key.
     */
    cmcApiKey: string;

    /**
     * The fixer api key.
     */
    fixerApiKey: string;

    /**
     * The dynamic db connection.
     */
    dynamoDbConnection: IAWSDynamoDbConfiguration;

    /**
     * A list of domains allowed to access the api.
     */
    allowedDomains: string[];
}
