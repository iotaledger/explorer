import { ServiceFactory } from "../factories/serviceFactory";
import { IConfiguration } from "../models/configuration/IConfiguration";
import { IStorageService } from "../models/services/IStorageService";
import { CurrencyService } from "../services/currencyService";

/**
 * Initialise the database.
 * @param config The configuration.
 * @returns The response.
 */
export async function init(config: IConfiguration): Promise<string[]> {
    let log = "Initializing\n";

    try {
        const stateStorageService = ServiceFactory.get<IStorageService<any>>("currency-storage");
        if (stateStorageService) {
            log += await stateStorageService.create();
        }

        const milestoneStorageService = ServiceFactory.get<IStorageService<any>>("milestone-storage");
        if (milestoneStorageService) {
            log += await milestoneStorageService.create();
        }

        const currencyService = ServiceFactory.get<CurrencyService>("currency");

        if (currencyService) {
            log += await currencyService.update(true);
        }
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
