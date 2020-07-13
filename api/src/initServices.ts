
import { ServiceFactory } from "./factories/serviceFactory";
import { ISchedule } from "./models/app/ISchedule";
import { IConfiguration } from "./models/configuration/IConfiguration";
import { INetworkConfiguration } from "./models/configuration/INetworkConfiguration";
import { IMilestoneStore } from "./models/db/IMilestoneStore";
import { AmazonDynamoDbService } from "./services/amazonDynamoDbService";
import { LocalStorageService } from "./services/localStorageService";
import { MilestonesService } from "./services/milestonesService";
import { StateService } from "./services/stateService";
import { TransactionsService } from "./services/transactionsService";
import { ZmqService } from "./services/zmqService";
import { ScheduleHelper } from "./utils/scheduleHelper";
import { IState } from "./models/db/IState";

/**
 * Initialise all the services.
 * @param config The configuration to initialisation the service with.
 */
export async function initServices(config: IConfiguration): Promise<void> {
    const networkByName: { [id: string]: INetworkConfiguration } = {};

    for (const networkConfig of config.networks) {
        networkByName[networkConfig.network] = networkConfig;

        if (networkConfig.zmqEndpoint) {
            ServiceFactory.register(
                `zmq-${networkConfig.network}`,
                serviceName => new ZmqService(networkByName[serviceName.substr(4)].zmqEndpoint)
            );
            ServiceFactory.register(
                `milestones-${networkConfig.network}`,
                serviceName => new MilestonesService(networkByName[serviceName.substr(11)]));

            ServiceFactory.register(
                `transactions-${networkConfig.network}`,
                serviceName => new TransactionsService(networkByName[serviceName.substr(13)]));
        }
    }

    if (config.rootStorageFolder) {
        ServiceFactory.register("milestone-storage", () => new LocalStorageService<IMilestoneStore>(
            config.rootStorageFolder, "milestones", "network"));

        ServiceFactory.register("state-storage", () => new LocalStorageService<IState>(
            config.rootStorageFolder, "state", "id"));
    } else if (config.dynamoDbConnection) {
        ServiceFactory.register("milestone-storage", () => new AmazonDynamoDbService<IMilestoneStore>(
            config.dynamoDbConnection, "milestones", "network"));

        ServiceFactory.register("state-storage", () => new AmazonDynamoDbService<IState>(
            config.dynamoDbConnection, "state", "id"));
    }

    for (const networkConfig of config.networks) {
        const zmqService = ServiceFactory.get<ZmqService>(`zmq-${networkConfig.network}`);
        zmqService.connect();
    }

    for (const networkConfig of config.networks) {
        const milestonesService = ServiceFactory.get<MilestonesService>(`milestones-${networkConfig.network}`);
        await milestonesService.init();

        const transactionService = ServiceFactory.get<TransactionsService>(`transactions-${networkConfig.network}`);
        await transactionService.init();
    }

    ServiceFactory.register("state", () => new StateService(config));

    const schedules: ISchedule[] = [
        {
            name: "Update Currencies",
            schedule: "0 0 */4 * * *", // Every 4 hours on 0 minute 0 seconds
            func: async () => {
                const stateService = ServiceFactory.get<StateService>("state");

                const log = await stateService.updateCurrencies();
                console.log(log);
            }
        }
    ];

    await ScheduleHelper.build(schedules);
}
