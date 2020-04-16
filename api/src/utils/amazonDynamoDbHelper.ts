import * as aws from "aws-sdk";
import { IAWSDynamoDbConfiguration } from "../models/configuration/IAWSDynamoDbConfiguration";

/**
 * Class to helper with database.
 */
export class AmazonDynamoDbHelper {
    /**
     * Create and set the configuration for db.
     * @param config The configuration to use for connection.
     */
    public static createAndSetConfig(config: IAWSDynamoDbConfiguration): void {
        const awsConfig = new aws.Config({
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
            region: config.region
        });

        aws.config.update(awsConfig);
    }

    /**
     * Create a new DB connection.
     * @param config The configuration for the connection.
     * @returns The dynamo db connection.
     */
    public static createConnection(config: IAWSDynamoDbConfiguration): aws.DynamoDB {
        AmazonDynamoDbHelper.createAndSetConfig(config);

        return new aws.DynamoDB({ apiVersion: "2012-10-08" });
    }

    /**
     * Create a doc client connection.
     * @param config The configuration to use for connection.
     * @returns The dynamo db document client.
     */
    public static createDocClient(config: IAWSDynamoDbConfiguration): aws.DynamoDB.DocumentClient {
        AmazonDynamoDbHelper.createAndSetConfig(config);

        return new aws.DynamoDB.DocumentClient({
            apiVersion: "2012-10-08",
            convertEmptyValues: true
        });
    }
}
