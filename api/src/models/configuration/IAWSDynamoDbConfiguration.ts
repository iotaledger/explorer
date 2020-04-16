/**
 * Definition of AWS DB configuration.
 */
export interface IAWSDynamoDbConfiguration {
    /**
     * The region for the AWS connection.
     */
    region: string;
    /**
     * The AWS access key.
     */
    accessKeyId: string;
    /**
     * The AWS secret access key.
     */
    secretAccessKey: string;
    /**
     * Prefix for all tables.
     */
    dbTablePrefix: string;
}
