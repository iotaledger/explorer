import { MqttClient as ChrysalisMqttClient } from "@iota/mqtt.js";
import { ClientOptions as INovaClientOptions, Client as NovaClient } from "@iota/sdk-nova";
import { IClientOptions as IStardustClientOptions, Client as StardustClient } from "@iota/sdk-stardust";
import { ServiceFactory } from "./factories/serviceFactory";
import logger from "./logger";
import { IConfiguration } from "./models/configuration/IConfiguration";
import { ICurrencyState } from "./models/db/ICurrencyState";
import { INetwork } from "./models/db/INetwork";
import { CHRYSALIS, LEGACY, NOVA, STARDUST } from "./models/db/protocolVersion";
import { IItemsService as IItemsServiceChrysalis } from "./models/services/chrysalis/IItemsService";
import { IFeedService } from "./models/services/IFeedService";
import { IItemsService as IItemsServiceLegacy } from "./models/services/legacy/IItemsService";
import { AmazonDynamoDbService } from "./services/amazonDynamoDbService";
import { ChrysalisFeedService } from "./services/chrysalis/chrysalisFeedService";
import { ChrysalisItemsService } from "./services/chrysalis/chrysalisItemsService";
import { ChrysalisStatsService } from "./services/chrysalis/chrysalisStatsService";
import { CurrencyService } from "./services/currencyService";
import { LegacyFeedService } from "./services/legacy/legacyFeedService";
import { LegacyItemsService } from "./services/legacy/legacyItemsService";
import { LegacyStatsService } from "./services/legacy/legacyStatsService";
import { ZmqService } from "./services/legacy/zmqService";
import { LocalStorageService } from "./services/localStorageService";
import { NetworkService } from "./services/networkService";
import { ChronicleService as ChronicleServiceNova } from "./services/nova/chronicleService";
import { NovaFeed } from "./services/nova/feed/novaFeed";
import { InfluxServiceNova } from "./services/nova/influx/influxServiceNova";
import { NodeInfoService as NodeInfoServiceNova } from "./services/nova/nodeInfoService";
import { NovaApiService } from "./services/nova/novaApiService";
import { NovaTimeService } from "./services/nova/novaTimeService";
import { NovaStatsService } from "./services/nova/stats/novaStatsService";
import { ValidatorService } from "./services/nova/validatorService";
import { ChronicleService as ChronicleServiceStardust } from "./services/stardust/chronicleService";
import { StardustFeed } from "./services/stardust/feed/stardustFeed";
import { InfluxServiceStardust } from "./services/stardust/influx/influxServiceStardust";
import { NodeInfoService as NodeInfoServiceStardust } from "./services/stardust/nodeInfoService";
import { StardustApiService } from "./services/stardust/stardustApiService";
import { StardustStatsService } from "./services/stardust/stats/stardustStatsService";

// iota-sdk debug
// initLogger();

const CURRENCY_UPDATE_INTERVAL_MS = 5 * 60000;

const isKnownProtocolVersion = (networkConfig: INetwork) =>
    networkConfig.protocolVersion === LEGACY ||
    networkConfig.protocolVersion === CHRYSALIS ||
    networkConfig.protocolVersion === STARDUST ||
    networkConfig.protocolVersion === NOVA;

/**
 * Initialise all the services for the workers.
 * @param config The configuration to initialisation the service with.
 */
export async function initServices(config: IConfiguration) {
    await registerStorageServices(config);

    const networkService = new NetworkService();
    ServiceFactory.register("network", () => networkService);
    await networkService.buildCache();
    const networks = networkService.networks();
    const enabledNetworks = networks.filter((v) => v.isEnabled);

    for (const networkConfig of enabledNetworks) {
        if (networkConfig.feedEndpoint) {
            switch (networkConfig.protocolVersion) {
                case LEGACY: {
                    initLegacyServices(networkConfig);
                    break;
                }
                case CHRYSALIS: {
                    initChrysalisServices(networkConfig);
                    break;
                }
                case STARDUST: {
                    initStardustServices(networkConfig);
                    break;
                }
                case NOVA: {
                    initNovaServices(networkConfig);
                    break;
                }
                default:
            }
        }
    }

    // Init for legacy and chrysalis Zmq/Mqtt
    for (const networkConfig of enabledNetworks) {
        if (isKnownProtocolVersion(networkConfig)) {
            if (networkConfig.protocolVersion === LEGACY) {
                const zmqService = ServiceFactory.get<ZmqService>(`zmq-${networkConfig.network}`);
                if (zmqService) {
                    zmqService.connect();
                }
            }

            if (networkConfig.protocolVersion === LEGACY || networkConfig.protocolVersion === CHRYSALIS) {
                const itemsService = ServiceFactory.get<IItemsServiceLegacy | IItemsServiceChrysalis>(`items-${networkConfig.network}`);
                if (itemsService) {
                    itemsService.init();
                }

                const feedService = ServiceFactory.get<IFeedService>(`feed-${networkConfig.network}`);
                if (feedService) {
                    feedService.connect();
                }
            }
        }
    }

    const currencyService = new CurrencyService(config);
    const update = async () => {
        logger.verbose("[CurrencyService] Updating currency data");
        // eslint-disable-next-line no-void
        void currencyService.update();
    };

    setInterval(update, CURRENCY_UPDATE_INTERVAL_MS);

    await update();
}

/**
 * Register services for legacy network
 * @param networkConfig The Network Config.
 */
function initLegacyServices(networkConfig: INetwork): void {
    if (networkConfig.feedEndpoint) {
        logger.verbose(`Initializing Legacy services for ${networkConfig.network}`);
        ServiceFactory.register(
            `zmq-${networkConfig.network}`,
            () => new ZmqService(networkConfig.feedEndpoint, ["trytes", "sn", networkConfig.coordinatorAddress]),
        );
        ServiceFactory.register(
            `feed-${networkConfig.network}`,
            () => new LegacyFeedService(networkConfig.network, networkConfig.coordinatorAddress),
        );
        ServiceFactory.register(`items-${networkConfig.network}`, () => new LegacyItemsService(networkConfig.network));

        ServiceFactory.register(`stats-${networkConfig.network}`, () => new LegacyStatsService(networkConfig));
    }
}

/**
 * Register services for chrysalis network
 * @param networkConfig The Network Config.
 */
function initChrysalisServices(networkConfig: INetwork): void {
    logger.verbose(`Initializing Chrysalis services for ${networkConfig.network}`);
    ServiceFactory.register(`mqtt-${networkConfig.network}`, () => new ChrysalisMqttClient(networkConfig.feedEndpoint.split(";")));
    ServiceFactory.register(
        `feed-${networkConfig.network}`,
        () => new ChrysalisFeedService(networkConfig.network, networkConfig.provider, networkConfig.user, networkConfig.password),
    );
    ServiceFactory.register(`items-${networkConfig.network}`, () => new ChrysalisItemsService(networkConfig.network));
    ServiceFactory.register(`stats-${networkConfig.network}`, () => new ChrysalisStatsService(networkConfig));
}

/**
 * Register services for stardust network
 * @param networkConfig The Network Config.
 */
function initStardustServices(networkConfig: INetwork): void {
    logger.verbose(`Initializing Stardust services for ${networkConfig.network}`);

    const stardustClientParams: IStardustClientOptions = {
        primaryNode: networkConfig.provider,
    };

    if (networkConfig.permaNodeEndpoint) {
        stardustClientParams.nodes = [networkConfig.permaNodeEndpoint];
        // Client with permanode needs the ignoreNodeHealth as chronicle is considered "not healthy" by the sdk
        // Related: https://github.com/iotaledger/inx-chronicle/issues/1302
        stardustClientParams.ignoreNodeHealth = true;

        const chronicleService = new ChronicleServiceStardust(networkConfig);
        ServiceFactory.register(`chronicle-${networkConfig.network}`, () => chronicleService);
    }

    const stardustClient = new StardustClient(stardustClientParams);
    ServiceFactory.register(`client-${networkConfig.network}`, () => stardustClient);

    const stardustApiService = new StardustApiService(networkConfig);
    ServiceFactory.register(`api-service-${networkConfig.network}`, () => stardustApiService);

    // eslint-disable-next-line no-void
    void NodeInfoServiceStardust.build(networkConfig).then((nodeInfoService) => {
        ServiceFactory.register(`node-info-${networkConfig.network}`, () => nodeInfoService);

        const stardustFeed = new StardustFeed(networkConfig);
        ServiceFactory.register(`feed-${networkConfig.network}`, () => stardustFeed);
    });

    const stardustStatsService = new StardustStatsService(networkConfig);
    ServiceFactory.register(`stats-${networkConfig.network}`, () => stardustStatsService);

    const influxDBService = new InfluxServiceStardust(networkConfig);
    influxDBService
        .buildClient()
        .then((hasClient) => {
            logger.debug(`[InfluxDb] Registering client with name "${networkConfig.network}". Has client: ${hasClient}`);
            if (hasClient) {
                ServiceFactory.register(`influxdb-${networkConfig.network}`, () => influxDBService);
            }
        })
        .catch((e) => logger.warn(`Failed to build influxDb client for "${networkConfig.network}". Cause: ${e}`));
}

/**
 * Register services for nova network
 * @param networkConfig The Network Config.
 */
function initNovaServices(networkConfig: INetwork): void {
    logger.verbose(`Initializing Nova services for ${networkConfig.network}`);

    const novaClientParams: INovaClientOptions = {
        primaryNodes: [networkConfig.provider],
    };

    if (networkConfig.permaNodeEndpoint) {
        const chronicleNode = {
            url: networkConfig.permaNodeEndpoint,
            permanode: true,
        };
        novaClientParams.primaryNodes.push(chronicleNode);

        const chronicleService = new ChronicleServiceNova(networkConfig);
        ServiceFactory.register(`chronicle-${networkConfig.network}`, () => chronicleService);
    }

    const novaStatsService = new NovaStatsService(networkConfig);
    ServiceFactory.register(`stats-${networkConfig.network}`, () => novaStatsService);

    // eslint-disable-next-line no-void
    void NovaClient.create(novaClientParams).then((novaClient) => {
        ServiceFactory.register(`client-${networkConfig.network}`, () => novaClient);

        // eslint-disable-next-line no-void
        void NodeInfoServiceNova.build(networkConfig).then((nodeInfoService) => {
            ServiceFactory.register(`node-info-${networkConfig.network}`, () => nodeInfoService);

            const novaFeed = new NovaFeed(networkConfig);
            ServiceFactory.register(`feed-${networkConfig.network}`, () => novaFeed);
        });

        NovaTimeService.build(novaClient)
            .then((novaTimeService) => {
                ServiceFactory.register(`nova-time-${networkConfig.network}`, () => novaTimeService);

                const novaApiService = new NovaApiService(networkConfig);
                ServiceFactory.register(`api-service-${networkConfig.network}`, () => novaApiService);

                const influxDBService = new InfluxServiceNova(networkConfig);
                influxDBService
                    .buildClient()
                    .then((hasClient) => {
                        logger.debug(`[InfluxDb] Registering client with name "${networkConfig.network}". Has client: ${hasClient}`);
                        if (hasClient) {
                            ServiceFactory.register(`influxdb-${networkConfig.network}`, () => influxDBService);
                        }
                    })
                    .catch((e) => logger.error(`Failed to build influxDb client for "${networkConfig.network}". Cause: ${e}`));
            })
            .catch((err) => {
                logger.error(`Failed building [novaTimeService]. Cause: ${err}`);
            });

        const validatorService = new ValidatorService(networkConfig);
        validatorService.setupValidatorsCollection();
        ServiceFactory.register(`validator-service-${networkConfig.network}`, () => validatorService);
    });
}

/**
 * Register the storage services.
 * @param config The config.
 */
async function registerStorageServices(config: IConfiguration): Promise<void> {
    if (config.rootStorageFolder) {
        logger.info("Registering 'local' persistence services...");
        ServiceFactory.register("network-storage", () => new LocalStorageService<INetwork>(config.rootStorageFolder, "network", "network"));

        ServiceFactory.register(
            "currency-storage",
            () => new LocalStorageService<ICurrencyState>(config.rootStorageFolder, "currency", "id"),
        );
    } else if (config.dynamoDbConnection) {
        logger.info("Registering 'dynamoDB' persistence services...");
        ServiceFactory.register(
            "network-storage",
            () => new AmazonDynamoDbService<INetwork>(config.dynamoDbConnection, "network", "network"),
        );

        ServiceFactory.register(
            "currency-storage",
            () => new AmazonDynamoDbService<ICurrencyState>(config.dynamoDbConnection, "currency", "id"),
        );
    }
}
