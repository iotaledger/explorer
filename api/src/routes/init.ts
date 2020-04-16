import { IConfiguration } from "../models/configuration/IConfiguration";
import { MilestoneStoreService } from "../services/milestoneStoreService";
import { StateService } from "../services/stateService";

/**
 * Initialise the database.
 * @param config The configuration.
 * @returns The response.
 */
export async function init(config: IConfiguration): Promise<string[]> {
    let log = "Initializing\n";

    try {
        const stateService = new StateService(config.dynamoDbConnection);
        log += await stateService.createTable();

        const milestoneStoreService = new MilestoneStoreService(config.dynamoDbConnection);
        log += await milestoneStoreService.createTable();

        log += await stateService.updateCurrencies(config);
    } catch (err) {
        log += `Failed\n${err.toString()}\n`;
    }

    if (log.indexOf("Failed") < 0) {
        log += "Initialization Succeeded";
    } else {
        log += "Initialization Failed";
    }

    return log.split("\n");
}
