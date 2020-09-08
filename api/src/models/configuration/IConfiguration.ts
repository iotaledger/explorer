import { IAWSDynamoDbConfiguration } from "./IAWSDynamoDbConfiguration";

/**
 * Definition of configuration file.
 */
export interface IConfiguration {
    /**
     * The fixer api key.
     */
    fixerApiKey: string;

    /**
     * The dynamic db connection.
     */
    dynamoDbConnection?: IAWSDynamoDbConfiguration;

    /**
     * Optional local folder storage of dynamo DB connection not supplied.
     */
    rootStorageFolder?: string;

    /**
     * A list of domains allowed to access the api.
     */
    allowedDomains: string[];

    /**
     * Enable verbose API logging.
     */
    verboseLogging: boolean;
}
