
import { ServiceFactory } from "./factories/serviceFactory";
import { ISchedule } from "./models/app/ISchedule";
import { IConfiguration } from "./models/configuration/IConfiguration";
import { ICurrencyState } from "./models/db/ICurrencyState";
import { IMarket } from "./models/db/IMarket";
import { IMilestoneStore } from "./models/db/IMilestoneStore";
import { INetwork } from "./models/db/INetwork";
import { AmazonDynamoDbService } from "./services/amazonDynamoDbService";
import { CurrencyService } from "./services/currencyService";
import { LocalStorageService } from "./services/localStorageService";
import { MilestonesService } from "./services/milestonesService";
import { NetworkService } from "./services/networkService";
import { TransactionsService } from "./services/transactionsService";
import { ZmqService } from "./services/zmqService";
import { ScheduleHelper } from "./utils/scheduleHelper";

/**
 * Initialise all the services.
 * @param config The configuration to initialisation the service with.
 */
export async function initServices(config: IConfiguration): Promise<void> {
    if (config.rootStorageFolder) {
        ServiceFactory.register("network-storage", () => new LocalStorageService<INetwork>(
            config.rootStorageFolder, "network", "network"));

        ServiceFactory.register("milestone-storage", () => new LocalStorageService<IMilestoneStore>(
            config.rootStorageFolder, "milestones", "network"));

        ServiceFactory.register("currency-storage", () => new LocalStorageService<ICurrencyState>(
            config.rootStorageFolder, "currency", "id"));

        ServiceFactory.register("market-storage", () => new LocalStorageService<IMarket>(
            config.rootStorageFolder, "market", "currency"));
    } else if (config.dynamoDbConnection) {
        ServiceFactory.register("network-storage", () => new AmazonDynamoDbService<IMarket>(
            config.dynamoDbConnection, "network", "network"));

        ServiceFactory.register("milestone-storage", () => new AmazonDynamoDbService<IMilestoneStore>(
            config.dynamoDbConnection, "milestones", "network"));

        ServiceFactory.register("currency-storage", () => new AmazonDynamoDbService<ICurrencyState>(
            config.dynamoDbConnection, "currency", "id"));

        ServiceFactory.register("market-storage", () => new AmazonDynamoDbService<IMarket>(
            config.dynamoDbConnection, "market", "currency"));
    }

    const networkService = new NetworkService();
    ServiceFactory.register("network", () => networkService);

    await networkService.buildCache();

    const networks = networkService.networks();

    for (const networkConfig of networks) {
        if (networkConfig.zmqEndpoint) {
            ServiceFactory.register(
                `zmq-${networkConfig.network}`,
                () => new ZmqService(networkConfig.zmqEndpoint)
            );

            ServiceFactory.register(
                `milestones-${networkConfig.network}`,
                () => new MilestonesService(networkConfig.network));


            ServiceFactory.register(
                `transactions-${networkConfig.network}`,
                () => new TransactionsService(networkConfig.network));
        }
    }

    for (const networkConfig of networks) {
        const zmqService = ServiceFactory.get<ZmqService>(`zmq-${networkConfig.network}`);
        if (zmqService) {
            zmqService.connect();
        }

        const milestonesService = ServiceFactory.get<MilestonesService>(`milestones-${networkConfig.network}`);
        if (milestonesService) {
            await milestonesService.init();
        }

        const transactionService = ServiceFactory.get<TransactionsService>(`transactions-${networkConfig.network}`);

        if (transactionService) {
            await transactionService.init();
        }
    }

    ServiceFactory.register("currency", () => new CurrencyService(config));

    const schedules: ISchedule[] = [
        {
            name: "Update Currencies",
            schedule: "0 0 */4 * * *", // Every 4 hours on 0 minute 0 seconds
            func: async () => {
                const currencyService = ServiceFactory.get<CurrencyService>("currency");

                const log = await currencyService.update();
                console.log(log);
            }
        }
    ];

    ScheduleHelper.build(schedules);
}
