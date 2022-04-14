import { ServiceFactory } from "../factories/serviceFactory";
import { IConfiguration } from "../models/configuration/IConfiguration";
import { ICurrencyState } from "../models/db/ICurrencyState";
import { IMarket } from "../models/db/IMarket";
import { IMilestoneStore } from "../models/db/IMilestoneStore";
import { INetwork } from "../models/db/INetwork";
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
        const networkStorageService = ServiceFactory.get<IStorageService<INetwork>>("network-storage");
        if (networkStorageService) {
            log += await networkStorageService.create();
        }

        const marketStorageService = ServiceFactory.get<IStorageService<IMarket>>("market-storage");
        if (marketStorageService) {
            log += await marketStorageService.create();
        }

        const currencyStorageService = ServiceFactory.get<IStorageService<ICurrencyState>>("currency-storage");
        if (currencyStorageService) {
            log += await currencyStorageService.create();
        }

        const milestoneStorageService = ServiceFactory.get<IStorageService<IMilestoneStore>>("milestone-storage");
        if (milestoneStorageService) {
            log += await milestoneStorageService.create();
        }

        const currencyService = new CurrencyService(config);
        if (currencyService) {
            log += await currencyService.update(true);
            log += await currencyService.updateCurrencyNames();
        }
    } catch (err) {
        log += `Failed\n${err.toString()}\n`;
    }

    log += !log.includes("Failed") ? "Initialization Succeeded" : "Initialization Failed";

    return log.split("\n");
}
