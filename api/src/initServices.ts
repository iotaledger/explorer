import { MqttClient as ChrysalisMqttClient } from "@iota/mqtt.js";
import { MqttClient as StardustMqttClient } from "@iota/mqtt.js-stardust";
import { WebSocketClient, WsMsgType } from "@iota/protonet.js";
import { Server as SocketIOServer } from "socket.io";
import { ServiceFactory } from "./factories/serviceFactory";
import logger from "./logger";
import { IConfiguration } from "./models/configuration/IConfiguration";
import { ICurrencyState } from "./models/db/ICurrencyState";
import { INetwork } from "./models/db/INetwork";
import { CHRYSALIS, LEGACY, PROTO, STARDUST } from "./models/db/protocolVersion";
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
    networkConfig.protocolVersion === STARDUST ||
    networkConfig.protocolVersion === PROTO;

/**
 * Initialise all the services for the workers.
 * @param socketServer The socket server.
 * @param config The configuration to initialisation the service with.
 */
export async function initServices(socketServer: SocketIOServer, config: IConfiguration) {
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
                case PROTO:
                    initProtoServices(socketServer, networkConfig);
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
        `mqtt-${networkConfig.network}`, () => new StardustMqttClient(
            networkConfig.feedEndpoint.split(";"))
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
 * Register services for prototype network
 * @param socketServer The socket server
 * @param networkConfig The Network Config.
 */
function initProtoServices(socketServer: SocketIOServer, networkConfig: INetwork): void {
    const protoWebSocketClient = new WebSocketClient(networkConfig.feedEndpoint);
    ServiceFactory.register(
        `ws-${networkConfig.network}`, () => protoWebSocketClient
    );
    protoWebSocketClient.onNodeStatus(msg => {
        const key = WsMsgType.NodeStatus.toString();
        socketServer.to(`proto-${key}`).emit(key, msg);
    });

    protoWebSocketClient.onBpsMetric(msg => {
        const key = WsMsgType.BPSMetric.toString();
        socketServer.to(`proto-${key}`).emit(key, msg);
    });

    protoWebSocketClient.onBlock(msg => {
        const key = WsMsgType.Block.toString();
        socketServer.to(`proto-${key}`).emit(key, msg);
    });

    protoWebSocketClient.onNeighborMetrics(msg => {
        const key = WsMsgType.NeighborMetrics.toString();
        socketServer.to(`proto-${key}`).emit(key, msg);
    });

    protoWebSocketClient.onComponentCounterMetric(msg => {
        const key = WsMsgType.ComponentCounterMetrics.toString();
        socketServer.to(`proto-${key}`).emit(key, msg);
    });

    protoWebSocketClient.onTipsMetric(msg => {
        const key = WsMsgType.TipsMetric.toString();
        socketServer.to(`proto-${key}`).emit(key, msg);
    });

    protoWebSocketClient.onVertex(msg => {
        const key = WsMsgType.Vertex.toString();
        socketServer.to(`proto-${key}`).emit(key, msg);
    });

    protoWebSocketClient.onTipInfo(msg => {
        const key = WsMsgType.TipInfo.toString();
        socketServer.to(`proto-${key}`).emit(key, msg);
    });

    protoWebSocketClient.onManaValue(msg => {
        const key = WsMsgType.ManaValue.toString();
        socketServer.to(`proto-${key}`).emit(key, msg);
    });

    protoWebSocketClient.onManaMapOverall(msg => {
        const key = WsMsgType.ManaMapOverall.toString();
        socketServer.to(`proto-${key}`).emit(key, msg);
    });

    protoWebSocketClient.onManaMapOnline(msg => {
        const key = WsMsgType.ManaMapOnline.toString();
        socketServer.to(`proto-${key}`).emit(key, msg);
    });

    protoWebSocketClient.onRateSetterMetric(msg => {
        const key = WsMsgType.RateSetterMetric.toString();
        socketServer.to(`proto-${key}`).emit(key, msg);
    });

    protoWebSocketClient.onConflictsConflictSet(msg => {
        const key = WsMsgType.ConflictsConflictSet.toString();
        socketServer.to(`proto-${key}`).emit(key, msg);
    });

    protoWebSocketClient.onConflictsConflict(msg => {
        const key = WsMsgType.ConflictsConflict.toString();
        socketServer.to(`proto-${key}`).emit(key, msg);
    });
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
