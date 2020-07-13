import * as aws from "aws-sdk";
import { IAWSDynamoDbConfiguration } from "../models/configuration/IAWSDynamoDbConfiguration";
import { IStorageService } from "../models/services/IStorageService";

/**
 * Service to handle db requests.
 */
export class AmazonDynamoDbService<T> implements IStorageService<T> {
    /**
     * The name of the database table.
     */
    protected _fullTableName: string;

    /**
     * Configuration to connection to AWS.
     */
    protected readonly _config: IAWSDynamoDbConfiguration;

    /**
     * The id field name.
     */
    protected readonly _idName: string;

    /**
     * Create a new instance of AmazonDynamoDbService
     * @param config The config for the DB connection.
     * @param tableName The name of the table.
     * @param idName The item id field.
     */
    constructor(config: IAWSDynamoDbConfiguration, tableName: string, idName: string) {
        this._config = config;
        this._fullTableName = `${this._config.dbTablePrefix}${tableName}`;
        this._idName = idName;
    }

    /**
     * Create the storage for the items.
     * @returns Log of the table creation.
     */
    public async create(): Promise<string> {
        let log = `Creating table '${this._fullTableName}'\n`;

        try {
            const dbConnection = this.createConnection();

            const tableParams = {
                AttributeDefinitions: [
                    {
                        AttributeName: this._idName,
                        AttributeType: "S"
                    }
                ],
                KeySchema: [
                    {
                        AttributeName: this._idName,
                        KeyType: "HASH"
                    }
                ],
                ProvisionedThroughput: {
                    ReadCapacityUnits: 1,
                    WriteCapacityUnits: 1
                },
                TableName: this._fullTableName
            };

            await dbConnection.createTable(tableParams).promise();

            log += `Waiting for '${this._fullTableName}'\n`;

            await dbConnection.waitFor("tableExists", {
                TableName: this._fullTableName
            }).promise();

            log += `Table '${this._fullTableName}' Created Successfully\n`;
        } catch (err) {
            if (err.code === "ResourceInUseException") {
                log += `Table '${this._fullTableName}' Already Exists\n`;
            } else {
                log += `Table '${this._fullTableName}' Creation Failed\n${err.toString()}\n`;
            }
        }

        return log;
    }

    /**
     * Get the item.
     * @param id The id of the item to get.
     * @returns The object if it can be found or undefined.
     */
    public async get(id: string): Promise<T> {
        try {
            const docClient = this.createDocClient();

            const key = {};
            key[this._idName] = id;

            const response = await docClient.get({
                TableName: this._fullTableName,
                Key: key
            }).promise();

            return <T>response.Item;
        } catch (err) {
        }
    }

    /**
     * Set the item.
     * @param item The item to set.
     */
    public async set(item: T): Promise<void> {
        const docClient = this.createDocClient();

        await docClient.put({
            TableName: this._fullTableName,
            Item: item
        }).promise();
    }

    /**
     * Delete the item.
     * @param itemKey The key of the item to remove.
     */
    public async remove(itemKey: string): Promise<void> {
        const docClient = this.createDocClient();

        const key = {};
        key[this._idName] = itemKey;

        await docClient.delete({
            TableName: this._fullTableName,
            Key: key
        }).promise();
    }

    /**
     * Create and set the configuration for db.
     * @param config The configuration to use for connection.
     */
    private createAndSetConfig(): void {
        const awsConfig = new aws.Config({
            accessKeyId: this._config.accessKeyId,
            secretAccessKey: this._config.secretAccessKey,
            region: this._config.region
        });

        aws.config.update(awsConfig);
    }

    /**
     * Create a new DB connection.
     * @param config The configuration for the connection.
     * @returns The dynamo db connection.
     */
    private createConnection(): aws.DynamoDB {
        this.createAndSetConfig();

        return new aws.DynamoDB({ apiVersion: "2012-10-08" });
    }

    /**
     * Create a doc client connection.
     * @param config The configuration to use for connection.
     * @returns The dynamo db document client.
     */
    private createDocClient(): aws.DynamoDB.DocumentClient {
        this.createAndSetConfig();

        return new aws.DynamoDB.DocumentClient({
            apiVersion: "2012-10-08",
            convertEmptyValues: true
        });
    }
}
