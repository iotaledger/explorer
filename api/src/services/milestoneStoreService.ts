import { IAWSDynamoDbConfiguration } from "../models/configuration/IAWSDynamoDbConfiguration";
import { IMilestoneStore } from "../models/db/IMilestoneStore";
import { AmazonDynamoDbService } from "./amazonDynamoDbService";

/**
 * Service to store the milestones.
 */
export class MilestoneStoreService extends AmazonDynamoDbService<IMilestoneStore> {
    /**
     * The name of the database table.
     */
    public static readonly TABLE_NAME: string = "milestones";

    constructor(config: IAWSDynamoDbConfiguration) {
        super(config, MilestoneStoreService.TABLE_NAME, "network");
    }
}
