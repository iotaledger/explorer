
import cluster from "cluster";
import { ServiceFactory } from "./factories/serviceFactory";
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
import { ZmqHandlerService } from "./services/zmqHandlerService";
import { ZmqMessageService } from "./services/zmqMessageService";

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
            if (cluster.isMaster) {
                ServiceFactory.register(
                    `zmq-message-${networkConfig.network}`,
                    () => new ZmqMessageService(
                        networkConfig.zmqEndpoint,
                        networkConfig.network,
                        [
                            "sn",
                            "trytes",
                            networkConfig.coordinatorAddress
                        ],
                        async (network: string, msg: string) => {
                            // Always handle on the master thread.
                            const zmqService = ServiceFactory.get<ZmqHandlerService>(`zmq-${network}`);
                            await zmqService.handleMessage(msg);

                            // Additionally process with the workers
                            // Otherwise send them all to the worker threads
                            for (const workerId in cluster.workers) {
                                cluster.workers[workerId].send({ action: "zmq", network, msg });
                            }
                        })
                );
            }

            ServiceFactory.register(
                `zmq-${networkConfig.network}`, () => new ZmqHandlerService()
            );

            // Master receives messages on the process object, workers on the cluster.worker
            (cluster.isMaster ? process : cluster.worker)
                .on("message", async (message: { action: string; network: string; msg: string }) => {
                    if (message?.action === "zmq") {
                        const zmqService = ServiceFactory.get<ZmqHandlerService>(`zmq-${message.network}`);
                        await zmqService.handleMessage(message.msg);
                    }
                });

            ServiceFactory.register(
                `milestones-${networkConfig.network}`,
                () => new MilestonesService(networkConfig.network, cluster.isMaster));


            ServiceFactory.register(
                `transactions-${networkConfig.network}`,
                () => new TransactionsService(networkConfig.network));
        }
    }

    for (const networkConfig of networks) {
        if (cluster.isMaster) {
            const zmqService = ServiceFactory.get<ZmqMessageService>(`zmq-message-${networkConfig.network}`);
            if (zmqService) {
                zmqService.connect();
            }
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

    if (cluster.isMaster) {
        const UPDATE_INTERVAL_MINUTES = 240; // 4 hours

        const update = async () => {
            const currencyService = new CurrencyService(config);
            const log = await currencyService.update();
            console.log(log);
        };

        setInterval(
            update,
            UPDATE_INTERVAL_MINUTES * 60000);

        await update();
    }
}
