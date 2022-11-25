import { MqttClient as ChrysalisMqttClient } from "@iota/mqtt.js";
import { MqttClient as StardustMqttClient } from "@iota/mqtt.js-stardust";
import { ServiceFactory } from "./factories/serviceFactory";
import { IConfiguration } from "./models/configuration/IConfiguration";
import { IAnalyticsStore } from "./models/db/IAnalyticsStore";
import { ICurrencyState } from "./models/db/ICurrencyState";
import { IMarket } from "./models/db/IMarket";
import { IMilestoneStore } from "./models/db/IMilestoneStore";
import { INetwork } from "./models/db/INetwork";
import { CHRYSALIS, OG, PROTO, STARDUST } from "./models/db/protocolVersion";
import { IItemsService as IItemsServiceChrysalis } from "./models/services/chrysalis/IItemsService";
import { IFeedService } from "./models/services/IFeedService";
import { IItemsService as IItemsServiceStardust } from "./models/services/stardust/IItemsService";
import { AmazonDynamoDbService } from "./services/amazonDynamoDbService";
import { ChrysalisFeedService } from "./services/chrysalis/chrysalisFeedService";
import { ChrysalisItemsService } from "./services/chrysalis/chrysalisItemsService";
import { ChrysalisStatsService } from "./services/chrysalis/chrysalisStatsService";
import { CurrencyService } from "./services/currencyService";
import { LocalStorageService } from "./services/localStorageService";
import { MilestonesService } from "./services/milestonesService";
import { NetworkService } from "./services/networkService";
import { OgFeedService } from "./services/og/ogFeedService";
import { OgItemsService } from "./services/og/ogItemsService";
import { OgStatsService } from "./services/og/ogStatsService";
import { ZmqService } from "./services/og/zmqService";
import { ChronicleService } from "./services/stardust/chronicleService";
import { NodeInfoService } from "./services/stardust/nodeInfoService";
import { StardustFeedService } from "./services/stardust/stardustFeedService";
import { StardustItemsService } from "./services/stardust/stardustItemsService";
import { StardustStatsService } from "./services/stardust/stardustStatsService";

const isKnownProtocolVersion = (networkConfig: INetwork) =>
    networkConfig.protocolVersion === OG ||
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
        if (networkConfig.protocolVersion === OG) {
            initOgServices(networkConfig);
        } else if (networkConfig.protocolVersion === CHRYSALIS && networkConfig.feedEndpoint) {
            initChrysalisServices(networkConfig);
        } else if (networkConfig.protocolVersion === STARDUST && networkConfig.feedEndpoint) {
            initStardustServices(networkConfig);
        } else if (networkConfig.protocolVersion === PROTO && networkConfig.feedEndpoint) {
            initProtoServices(networkConfig);
        }

        if (isKnownProtocolVersion(networkConfig) && networkConfig.feedEndpoint) {
            ServiceFactory.register(
                `milestones-${networkConfig.network}`,
                () => new MilestonesService(networkConfig.network));
        }
    }

    for (const networkConfig of enabledNetworks) {
        if (networkConfig.protocolVersion === OG) {
            const zmqService = ServiceFactory.get<ZmqService>(`zmq-${networkConfig.network}`);
            if (zmqService) {
                zmqService.connect();
            }
        }

        if (isKnownProtocolVersion(networkConfig)) {
            const milestonesService = ServiceFactory.get<MilestonesService>(`milestones-${networkConfig.network}`);
            if (milestonesService) {
                await milestonesService.init();
            }
        }

        if (isKnownProtocolVersion(networkConfig)) {
            const itemsService = ServiceFactory.get<IItemsServiceChrysalis | IItemsServiceStardust>(
                `items-${networkConfig.network}`
            );

            if (itemsService) {
                itemsService.init();
            }
        }

        if (isKnownProtocolVersion(networkConfig)) {
            const feedService = ServiceFactory.get<IFeedService>(`feed-${networkConfig.network}`);
            if (feedService) {
                feedService.connect();
            }
        }
    }

    const currencyService = new CurrencyService(config);
    let log = await currencyService.updateCurrencyNames();
    console.log(log);

    const update = async () => {
        log = await currencyService.update();
        console.log(log);
    };

    setInterval(update, 60000);

    await update();
}

/**
 * Register services for legacy network
 * @param networkConfig The Network Config.
 */
function initOgServices(networkConfig: INetwork): void {
    if (networkConfig.feedEndpoint) {
        ServiceFactory.register(
            `zmq-${networkConfig.network}`, () => new ZmqService(
                networkConfig.feedEndpoint, [
                    "trytes",
                    "sn",
                    networkConfig.coordinatorAddress
                ])
        );
        ServiceFactory.register(
            `feed-${networkConfig.network}`, () => new OgFeedService(
                networkConfig.network, networkConfig.coordinatorAddress)
        );
        ServiceFactory.register(
            `items-${networkConfig.network}`,
            () => new OgItemsService(networkConfig.network));

        ServiceFactory.register(
            `stats-${networkConfig.network}`,
            () => new OgStatsService(networkConfig));
    }
}

/**
 * Register services for chrysalis network
 * @param networkConfig The Network Config.
 */
function initChrysalisServices(networkConfig: INetwork): void {
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
        `feed-${networkConfig.network}`, () => new StardustFeedService(
            networkConfig.network, networkConfig.provider, networkConfig.user, networkConfig.password)
    );

    ServiceFactory.register(
        `items-${networkConfig.network}`,
        () => new StardustItemsService(networkConfig.network)
    );

    const stardustStatsService = new StardustStatsService(networkConfig);
    ServiceFactory.register(
        `stats-${networkConfig.network}`,
        () => stardustStatsService
    );

    if (networkConfig.permaNodeEndpoint) {
        ServiceFactory.register(
            `chronicle-${networkConfig.network}`,
            () => new ChronicleService(networkConfig)
        );
    }
}

/**
 * Register services for prototype network
 * @param networkConfig The Network Config.
 */
function initProtoServices(networkConfig: INetwork): void {

}

/**
 * Register the storage services.
 * @param config The config.
 */
async function registerStorageServices(config: IConfiguration): Promise<void> {
    if (config.rootStorageFolder) {
        ServiceFactory.register("network-storage", () => new LocalStorageService<INetwork>(
            config.rootStorageFolder, "network", "network"));

        ServiceFactory.register("milestone-storage", () => new LocalStorageService<IMilestoneStore>(
            config.rootStorageFolder, "milestones", "network"));

        ServiceFactory.register("currency-storage", () => new LocalStorageService<ICurrencyState>(
            config.rootStorageFolder, "currency", "id"));

        ServiceFactory.register("market-storage", () => new LocalStorageService<IMarket>(
            config.rootStorageFolder, "market", "currency"));

        ServiceFactory.register("analytics-storage", () => new LocalStorageService<IAnalyticsStore>(
            config.rootStorageFolder, "analytics", "network"));
    } else if (config.dynamoDbConnection) {
        ServiceFactory.register("network-storage", () => new AmazonDynamoDbService<IMarket>(
            config.dynamoDbConnection, "network", "network"));

        ServiceFactory.register("milestone-storage", () => new AmazonDynamoDbService<IMilestoneStore>(
            config.dynamoDbConnection, "milestones", "network"));

        ServiceFactory.register("currency-storage", () => new AmazonDynamoDbService<ICurrencyState>(
            config.dynamoDbConnection, "currency", "id"));

        ServiceFactory.register("market-storage", () => new AmazonDynamoDbService<IMarket>(
            config.dynamoDbConnection, "market", "currency"));

        const analyticsStore = new AmazonDynamoDbService<IAnalyticsStore>(
            config.dynamoDbConnection, "analytics", "network"
        );
        // eslint-disable-next-line no-void
        await analyticsStore.create();
        ServiceFactory.register("analytics-storage", () => analyticsStore);
    }
}
