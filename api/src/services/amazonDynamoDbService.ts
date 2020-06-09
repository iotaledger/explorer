import { IAWSDynamoDbConfiguration } from "../models/configuration/IAWSDynamoDbConfiguration";
import { AmazonDynamoDbHelper } from "../utils/amazonDynamoDbHelper";

/**
 * Service to handle db requests.
 */
export abstract class AmazonDynamoDbService<T> {
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

    constructor(config: IAWSDynamoDbConfiguration, tableName: string, idName: string) {
        this._config = config;
        this._fullTableName = `${this._config.dbTablePrefix}${tableName}`;
        this._idName = idName;
    }

    /**
     * Create the table for the items.
     * @returns Log of the table creation.
     */
    public async createTable(): Promise<string> {
        let log = `Creating table '${this._fullTableName}'\n`;

        try {
            const dbConnection = AmazonDynamoDbHelper.createConnection(this._config);

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
            const docClient = AmazonDynamoDbHelper.createDocClient(this._config);

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
        const docClient = AmazonDynamoDbHelper.createDocClient(this._config);

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
        const docClient = AmazonDynamoDbHelper.createDocClient(this._config);

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
            const docClient = AmazonDynamoDbHelper.createDocClient(this._config);

            const response = await docClient.scan({
                TableName: this._fullTableName
            }).promise();

            return <T[]>response.Items;
        } catch (err) {
            return [];
        }
    }
}
