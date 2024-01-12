import * as aws from "aws-sdk";
import { BatchWriteItemRequestMap } from "aws-sdk/clients/dynamodb";
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
            log += err.code === "ResourceInUseException"
                ? `Table '${this._fullTableName}' Already Exists\n`
                : `Table '${this._fullTableName}' Creation Failed\n${err.toString()}\n`;
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

            return response.Item as T;
        } catch {
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
     * Get all the items.
     * @returns All the items for the table.
     */
    public async getAll(): Promise<T[]> {
        try {
            const docClient = this.createDocClient();

            let lastKey;
            let allItems: T[] = [];

            do {
                const response = await docClient.scan({
                    TableName: this._fullTableName,
                    ExclusiveStartKey: lastKey
                }).promise();

                if (allItems) {
                    allItems = allItems.concat(response.Items as T[]);
                }

                lastKey = response.LastEvaluatedKey;
            }
            while (lastKey);

            return allItems;
        } catch {
            return [];
        }
    }

    /**
     * Set the items in a batch.
     * @param items The items to set.
     */
    public async setAll(items: T[]): Promise<void> {
        const docClient = this.createDocClient();

        for (let i = 0; i < Math.ceil(items.length / 25); i++) {
            const params: BatchWriteItemRequestMap = {};

            params[this._fullTableName] = items
                .slice(i * 25, (i + 1) * 25)
                .map(item => (
                    {
                        PutRequest: {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            Item: item as any
                        }
                    }));

            await docClient.batchWrite({
                RequestItems: params
            }).promise();
        }
    }

    /**
     * Create and set the configuration for db.
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
     * @returns The dynamo db connection.
     */
    private createConnection(): aws.DynamoDB {
        this.createAndSetConfig();

        return new aws.DynamoDB({ apiVersion: "2012-10-08" });
    }

    /**
     * Create a doc client connection.
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
