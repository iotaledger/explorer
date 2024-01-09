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
   * A list of allowed methods to access the api.
   */
  allowedMethods?: string;

  /**
   * A list of allowed header to access the api.
   */
  allowedHeaders?: string;

  /**
   * Cors for specific routes
   */
  routeCors?: {
    /**
     * The route to match.
     */
    path: string;

    /**
     * A list of domains allowed to access the api route.
     */
    allowedDomains?: string[];

    /**
     * A list of allowed methods to access the api route.
     */
    allowedMethods?: string;

    /**
     * A list of allowed header to access the api route.
     */
    allowedHeaders?: string;
  }[];

  /**
   * Enable verbose API logging.
   */
  verboseLogging: boolean;

  /**
   * Private key for signing the api responses.
   */
  privateKeyEd25519?: string;
}
