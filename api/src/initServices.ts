import { Client as StardustMqttClient } from "@iota/sdk";
import { MqttClient as ChrysalisMqttClient } from "@iota/mqtt.js";
import { ServiceFactory } from "./factories/serviceFactory";
import logger from "./logger";
import { IConfiguration } from "./models/configuration/IConfiguration";
import { ICurrencyState } from "./models/db/ICurrencyState";
import { INetwork } from "./models/db/INetwork";
import { CHRYSALIS, LEGACY, STARDUST } from "./models/db/protocolVersion";
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
import { ChronicleService } from "./services/stardust/chronicleService";
import { StardustFeed } from "./services/stardust/feed/stardustFeed";
import { InfluxDBService } from "./services/stardust/influx/influxDbService";
import { NodeInfoService } from "./services/stardust/nodeInfoService";
import { StardustStatsService } from "./services/stardust/stats/stardustStatsService";

const CURRENCY_UPDATE_INTERVAL_MS = 5 * 60000;

const isKnownProtocolVersion = (networkConfig: INetwork) =>
    networkConfig.protocolVersion === LEGACY ||
    networkConfig.protocolVersion === CHRYSALIS ||
    networkConfig.protocolVersion === STARDUST;

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
    const enabledNetworks = networks.filter(v => v.isEnabled);

    for (const networkConfig of enabledNetworks) {
        if (networkConfig.feedEndpoint) {
            switch (networkConfig.protocolVersion) {
                case LEGACY:
                    initLegacyServices(networkConfig);
                    break;

                case CHRYSALIS:
                    initChrysalisServices(networkConfig);
                    break;

                case STARDUST:
                    initStardustServices(networkConfig);
                    break;

                default:
            }
        }
    }

    for (const networkConfig of enabledNetworks) {
        if (isKnownProtocolVersion(networkConfig)) {
            if (networkConfig.protocolVersion === LEGACY) {
                const zmqService = ServiceFactory.get<ZmqService>(`zmq-${networkConfig.network}`);
                if (zmqService) {
                    zmqService.connect();
                }
            }

            if (networkConfig.protocolVersion === LEGACY || networkConfig.protocolVersion === CHRYSALIS) {
                const itemsService = ServiceFactory.get<IItemsServiceLegacy | IItemsServiceChrysalis>(
                    `items-${networkConfig.network}`
                );
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
            `zmq-${networkConfig.network}`, () => new ZmqService(
                networkConfig.feedEndpoint, [
                "trytes",
                "sn",
                networkConfig.coordinatorAddress
            ])
        );
        ServiceFactory.register(
            `feed-${networkConfig.network}`, () => new LegacyFeedService(
                networkConfig.network, networkConfig.coordinatorAddress)
        );
        ServiceFactory.register(
            `items-${networkConfig.network}`,
            () => new LegacyItemsService(networkConfig.network));

        ServiceFactory.register(
            `stats-${networkConfig.network}`,
            () => new LegacyStatsService(networkConfig));
    }
}

/**
 * Register services for chrysalis network
 * @param networkConfig The Network Config.
 */
function initChrysalisServices(networkConfig: INetwork): void {
    logger.verbose(`Initializing Chrysalis services for ${networkConfig.network}`);
    ServiceFactory.register(
        `mqtt-${networkConfig.network}`, () => new ChrysalisMqttClient(
            networkConfig.feedEndpoint.split(";"))
    );
    ServiceFactory.register(
        `feed-${networkConfig.network}`, () => new ChrysalisFeedService(
            networkConfig.network, networkConfig.provider, networkConfig.user, networkConfig.password)
    );
    ServiceFactory.register(
        `items-${networkConfig.network}`,
        () => new ChrysalisItemsService(networkConfig.network));

    ServiceFactory.register(
        `stats-${networkConfig.network}`,
        () => new ChrysalisStatsService(networkConfig));
}

/**
 * Register services for stardust network
 * @param networkConfig The Network Config.
 */
function initStardustServices(networkConfig: INetwork): void {
    logger.verbose(`Initializing Stardust services for ${networkConfig.network}`);
    const nodeInfoService = new NodeInfoService(networkConfig);

    ServiceFactory.register(
        `node-info-${networkConfig.network}`,
        () => nodeInfoService
    );

    ServiceFactory.register(
        `mqtt-${networkConfig.network}`,
        () => new StardustMqttClient({ nodes: [networkConfig.feedEndpoint], brokerOptions: { useWs: true } })
    );

    ServiceFactory.register(
        `feed-${networkConfig.network}`,
        () => new StardustFeed(networkConfig.network)
    );

    const stardustStatsService = new StardustStatsService(networkConfig);
    ServiceFactory.register(
        `stats-${networkConfig.network}`,
        () => stardustStatsService
    );

    if (networkConfig.permaNodeEndpoint) {
        const chronicleService = new ChronicleService(networkConfig);
        ServiceFactory.register(
            `chronicle-${networkConfig.network}`,
            () => chronicleService
        );
    }

    const influxDBService = new InfluxDBService(networkConfig);
    influxDBService.buildClient().then(hasClient => {
        logger.debug(`[InfluxDb] Registering client with name "${networkConfig.network}". Has client: ${hasClient}`);
        if (hasClient) {
            ServiceFactory.register(
                `influxdb-${networkConfig.network}`,
                () => influxDBService
            );
        }
    }).catch(e => logger.warn(`Failed to build influxDb client for "${networkConfig.network}". Cause: ${e}`));
}

/**
 * Register the storage services.
 * @param config The config.
 */
async function registerStorageServices(config: IConfiguration): Promise<void> {
    if (config.rootStorageFolder) {
        logger.info("Registering 'local' persistence services...");
        ServiceFactory.register("network-storage", () => new LocalStorageService<INetwork>(
            config.rootStorageFolder, "network", "network"));

        ServiceFactory.register("currency-storage", () => new LocalStorageService<ICurrencyState>(
            config.rootStorageFolder, "currency", "id"));
    } else if (config.dynamoDbConnection) {
        logger.info("Registering 'dynamoDB' persistence services...");
        ServiceFactory.register("network-storage", () => new AmazonDynamoDbService<INetwork>(
            config.dynamoDbConnection, "network", "network"));

        ServiceFactory.register("currency-storage", () => new AmazonDynamoDbService<ICurrencyState>(
            config.dynamoDbConnection, "currency", "id"));
    }
}

