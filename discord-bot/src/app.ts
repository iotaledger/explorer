import { Client, MessageEmbed } from "discord.js";
import { FetchHelper } from "./fetchHelper";
import { INodeInfo } from "./models/api/chrysalis/INodeInfo";
import { IStatsGetResponse } from "./models/api/stats/IStatsGetResponse";
import { ICMCQuotesLatestResponse } from "./models/ICMCQuotesLatestResponse";
import { ICoinGeckoPriceResponse } from "./models/ICoinGeckoPriceResponse";
import { IConfiguration } from "./models/IConfiguration";
import { INetworksResponse } from "./models/INetworksResponse";

const COIN_GECKO_URL = "https://api.coingecko.com/api/v3/";
const CMC_URL = "https://pro-api.coinmarketcap.com/v1/";
const CHRYSALIS_STATUS = "https://chrysalis.iota.org/api/tokens";

const MS_60_MINUTES = 60 * 60 * 1000;
const MS_30_SECONDS = 30 * 1000;

const MARKET_TRIGGER = "!m";
const CHRYSALIS_TRIGGER = "!migration";

export class App {
    private readonly _config: IConfiguration;

    private _botClient: Client;

    private _explorerNetworks: INetworksResponse | undefined;

    private _timeLastNetworks: number;

    private _coinMarketCapCurrencies: string[];

    private _lastCoinMarketCapCurrencies: number;

    private _coinGeckoCurrencies: string[];

    private _lastCoinGeckoCurrencies: number;

    private readonly _lastReactions: { [id: string]: number };

    private _lastUsdTime: number;

    private _lastUsdPrice: number;

    private _lastChrysalisStats: {
        day: string;
        migrationAddresses: string;
        lockedTokens: string;
        migratedTokens: string;
        lastUpdated: string;
    }[];

    /**
     * Create a new instance of App.
     * @param config The configuration.
     */
    constructor(config: IConfiguration) {
        this._config = config;
        this._timeLastNetworks = 0;
        this._lastCoinMarketCapCurrencies = 0;
        this._coinMarketCapCurrencies = [];
        this._lastCoinGeckoCurrencies = 0;
        this._coinGeckoCurrencies = [];
        this._lastReactions = {};
        this._lastChrysalisStats = [];
        this._lastUsdPrice = 0;
        this._lastUsdTime = 0;
    }

    /**
     * Format the value to number of significant digits.
     * @param fiat The value to format.
     * @param numDigits The num of digits to include.
     * @param extendToFindMax The max number of digits.
     * @returns The formatted fiat.
     */
    public formatFiat(fiat: number, numDigits: number, extendToFindMax: number): string {
        const regEx = new RegExp(`^-?\\d*\\.?0*\\d{0,${numDigits}}`);

        const found = regEx.exec(fiat.toFixed(extendToFindMax));
        return found ? found[0] : fiat.toFixed(3);
    }

    /**
     * Start the bot.
     */
    public async start(): Promise<void> {
        await this.stop();

        this._botClient = new Client();
        this._botClient.on("ready", () => {
            console.log(`Logged in as ${this._botClient.user.tag}!`);
        });

        this._botClient.on("message", async msg => {
            try {
                if (msg.content.startsWith("!")) {
                    console.log("Bot Command", msg.content);

                    const now = Date.now();

                    if (this._lastReactions[msg.content] && now - this._lastReactions[msg.content] < MS_30_SECONDS) {
                        if (msg.content === CHRYSALIS_TRIGGER) {
                            const embed = await this.handleChrysalisStats();
                            if (embed) {
                                await msg.channel.send({ embed });
                            }
                        } else {
                            await msg.react("🐌");
                        }
                    } else {
                        let embed: MessageEmbed | undefined;

                        if (msg.content === MARKET_TRIGGER ||
                            msg.content.startsWith(`${MARKET_TRIGGER}-`)) {
                            embed = await this.handleMarket(msg.content);
                        } else if (msg.content === CHRYSALIS_TRIGGER) {
                            embed = await this.handleChrysalis();
                        } else {
                            embed = await this.handleNetwork(msg.content);
                        }
                        if (embed) {
                            this._lastReactions[msg.content] = now;

                            await msg.channel.send({ embed });
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            }
        });

        console.log("Bot Logging in...");
        await this._botClient.login(this._config.discordToken);
        console.log("Bot Login Complete");
    }

    /**
     * Stop the bot running.
     */
    public async stop(): Promise<void> {
        try {
            if (this._botClient) {
                this._botClient.destroy();
                this._botClient = undefined;
            }
        } catch (err) {
            console.error("Error Stopping bot", err);
        }
    }

    /**
     * Handle the network commands.
     * @param command The command to process.
     * @returns The message response.
     */
    private async handleNetwork(command: string): Promise<MessageEmbed | undefined> {
        if (command.startsWith("!")) {
            const network = command.slice(1);

            const status = await this.fetchNetworkData(network);

            if (status) {
                let color = status.color;
                let healthReason;
                let health;

                if (status.health === 0) {
                    color = "#ff6755";
                    health = "Bad";
                    healthReason = status.healthReason;
                } else if (status.health === 1) {
                    color = "#ff8b5c";
                    health = "Degraded";
                    healthReason = status.healthReason;
                }

                const embed = new MessageEmbed()
                    .setTitle(status.label)
                    .setColor(color)
                    .addField(status.protocol === "og"
                        ? "TPS" : "MPS", status.itemsPerSecond, true)
                    .addField(status.protocol === "og"
                        ? "CTPS" : "CMPS", status.confirmedItemsPerSecond, true)
                    .addField(status.protocol === "og" ? "Confirmation Rate" : "Referenced Rate",
                        `${status.confirmationRate.toFixed(1)}%`, true)
                    .addField("Latest Milestone Index", status.latestMilestoneIndex ?? "Unknown");

                if (health) {
                    embed.addField("Health", health);
                }
                if (healthReason) {
                    embed.addField("Reason", healthReason);
                }

                return embed;
            }
        }
    }

    /**
     * Fetch the status for a network.
     * @param network The network to process.
     * @returns The status for the network.
     */
    private async fetchNetworkData(network: string): Promise<{
        health?: number;
        healthReason?: string;
        itemsPerSecond?: number;
        confirmedItemsPerSecond?: number;
        confirmationRate?: number;
        latestMilestoneIndex?: number;
        label: string;
        protocol: string;
        color: string;
    } | undefined> {
        const now = Date.now();

        // If we are using explorer for status endpoints, grab a cached list of the networks
        if (this._config.explorerEndpoint &&
            (!this._explorerNetworks || now - this._timeLastNetworks > MS_60_MINUTES)) {
            this._explorerNetworks = await FetchHelper.json<unknown, INetworksResponse>(
                this._config.explorerEndpoint,
                "networks",
                "get");
            this._timeLastNetworks = now;
        }

        if (this._explorerNetworks?.networks) {
            const foundNetwork = this._explorerNetworks?.networks.find(
                n => n.network === network && n.isEnabled && !n.isHidden);

            if (foundNetwork) {
                const res = await FetchHelper.json<unknown, IStatsGetResponse>(
                    this._config.explorerEndpoint, `stats/${foundNetwork.network}`, "get");

                return {
                    ...res,
                    label: foundNetwork.label,
                    protocol: foundNetwork.protocolVersion,
                    color: foundNetwork.primaryColor
                };
            }
        } else if (this._config.chrysalisStatusEndpoints) {
            const statusEndpoint = this._config.chrysalisStatusEndpoints[network];

            if (statusEndpoint) {
                const res = await FetchHelper.json<unknown, { data: INodeInfo }>(
                    statusEndpoint.url, "api/v1/info", "get");

                const timeSinceLastMsInMinutes = (Date.now() - (res.data.latestMilestoneTimestamp * 1000)) / 60000;
                let health = 0;
                let healthReason = "No milestone within 5 minutes";
                if (timeSinceLastMsInMinutes < 2) {
                    health = 2;
                    healthReason = "OK";
                } else if (timeSinceLastMsInMinutes < 5) {
                    health = 1;
                    healthReason = "No milestone within 2 minutes";
                }

                return {
                    health,
                    healthReason,
                    itemsPerSecond: res.data.messagesPerSecond,
                    confirmedItemsPerSecond: res.data.referencedMessagesPerSecond,
                    confirmationRate: res.data.referencedRate,
                    latestMilestoneIndex: res.data.latestMilestoneIndex,
                    label: statusEndpoint.label,
                    protocol: "chrysalis",
                    color: statusEndpoint.color
                };
            }
        }
    }

    /**
     * Handle the market commands.
     * @param command The command to process.
     * @returns The message response.
     */
    private async handleMarket(command: string): Promise<MessageEmbed | undefined> {
        const parts = command.split("-");
        let convertCurrency = "usd";

        if (parts.length === 2) {
            convertCurrency = parts[1].toLowerCase();
        }

        const convertCurrencyUpper = convertCurrency.toUpperCase();

        let embed = new MessageEmbed()
            .setTitle(`Market ${convertCurrencyUpper}`)
            .setColor("#0fc1b7");

        let added = false;

        await this.updateCmcCurrencies();

        if (this._coinMarketCapCurrencies.includes(convertCurrency)) {
            const cmcResponse = await this.updateCmcQuotes(convertCurrency);

            if (!cmcResponse.data?.["1720"]?.quote[convertCurrencyUpper]) {
                console.error("CMC Response", cmcResponse);
            } else {
                const price = cmcResponse.data["1720"]?.quote[convertCurrencyUpper].price;
                const change1 = cmcResponse.data["1720"]?.quote[convertCurrencyUpper].percent_change_1h;
                const change24 = cmcResponse.data["1720"]?.quote[convertCurrencyUpper].percent_change_24h;

                if (convertCurrencyUpper === "USD") {
                    this._lastUsdPrice = price;
                }


                embed = embed.addField("CoinMarketCap",
                    this.formatFiat(price, 3, 8), true)
                    .addField("24H Change", `${change24 >= 0 ? "+" : ""}${change24.toFixed(2)}%`, true)
                    .addField("1H Change", `${change1 >= 0 ? "+" : ""}${change1.toFixed(2)}%`, true);
                added = true;
            }
        }

        await this.updateCoinGeckoCurrencies();

        if (this._coinGeckoCurrencies.includes(convertCurrency)) {
            const coinGeckoResponse = await FetchHelper.json<unknown, ICoinGeckoPriceResponse>(
                COIN_GECKO_URL,
                `simple/price?ids=iota&vs_currencies=${convertCurrency}&include_24hr_change=true&include_24hr_vol=true`,
                "get");

            if (!coinGeckoResponse.iota || !coinGeckoResponse.iota[convertCurrency]) {
                console.error("Coin Gecko Response", coinGeckoResponse);
            } else {
                const price = coinGeckoResponse.iota[convertCurrency];
                const change24 = coinGeckoResponse.iota[`${convertCurrency}_24h_change`];
                const volume24 = coinGeckoResponse.iota[`${convertCurrency}_24h_vol`];

                embed = embed
                    .addField("CoinGecko", this.formatFiat(price, 3, 8), true)
                    .addField("24H Change", `${change24 >= 0 ? "+" : ""}${change24.toFixed(2)}%`, true)
                    .addField("24H Volume", `${volume24.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, true);

                added = true;
            }
        }

        if (!added) {
            return new MessageEmbed()
                .setTitle("Market Unknown")
                .setColor("#0fc1b7")
                .addField(":cry:", "I have no data for that currency");
        }

        return embed;
    }

    /**
     * Update the CoinMarketCap data
     */
    private async updateCmcCurrencies(): Promise<void> {
        const now = Date.now();
        if (now - this._lastCoinMarketCapCurrencies > MS_60_MINUTES) {
            const response = await FetchHelper.json<unknown, { data?: { symbol: string }[] }>(
                CMC_URL,
                "cryptocurrency/map",
                "get",
                undefined,
                { "X-CMC_PRO_API_KEY": this._config.coinMarketCapKey }
            );

            if (response?.data) {
                this._coinMarketCapCurrencies = response?.data.map(d => d.symbol.toLowerCase());
            }

            const response2 = await FetchHelper.json<unknown, { data?: { symbol: string }[] }>(
                CMC_URL,
                "fiat/map",
                "get",
                undefined,
                { "X-CMC_PRO_API_KEY": this._config.coinMarketCapKey }
            );

            if (response2?.data) {
                this._coinMarketCapCurrencies =
                    this._coinMarketCapCurrencies.concat(response2?.data.map(d => d.symbol.toLowerCase()));
            }

            this._lastCoinMarketCapCurrencies = now;
        }
    }

    /**
     * Update the quote data for the currency.
     * @param currency The currency to retrieve.
     * @returns The quote data.
     */
    private async updateCmcQuotes(currency: string): Promise<ICMCQuotesLatestResponse> {
        return FetchHelper.json<unknown, ICMCQuotesLatestResponse>(
            CMC_URL,
            `cryptocurrency/quotes/latest?id=1720&convert=${currency}`,
            "get",
            undefined,
            { "X-CMC_PRO_API_KEY": this._config.coinMarketCapKey });
    }

    /**
     * Update the CoinGecko data.
     */
    private async updateCoinGeckoCurrencies(): Promise<void> {
        const now = Date.now();

        if (now - this._lastCoinGeckoCurrencies > MS_60_MINUTES) {
            const coinGeckoCurrenciesResponse = await FetchHelper.json<unknown, string[]>(
                COIN_GECKO_URL,
                "simple/supported_vs_currencies",
                "get");

            this._coinGeckoCurrencies = coinGeckoCurrenciesResponse;
            this._lastCoinGeckoCurrencies = now;
        }
    }

    /**
     * Handle the market commands.
     * @returns The message response.
     */
    private async handleChrysalis(): Promise<MessageEmbed | undefined> {
        const response = await FetchHelper.json<unknown, [{
            day: string;
            migrationAddresses: string;
            lockedTokens: string;
            migratedTokens: string;
            lastUpdated: string;
        }]>(
            CHRYSALIS_STATUS,
            "",
            "get"
        );

        if (Array.isArray(response)) {
            this._lastChrysalisStats = response.sort((a, b) => b.day.localeCompare(a.day));
            return this.handleChrysalisStats();
        }
    }

    /**
     * Handle the market commands.
     * @returns The message response.
     */
    private async handleChrysalisStats(): Promise<MessageEmbed | undefined> {
        const embed = new MessageEmbed()
            .setTitle("Chrysalis Migration")
            .setColor("#0fc1b7");

        const MAX_TOKENS = 2779530283000000;

        if (Array.isArray(this._lastChrysalisStats) && this._lastChrysalisStats.length > 0) {
            const totalMigrated = Number.parseInt(this._lastChrysalisStats[0].migratedTokens, 10);
            const totalAddresses = Number.parseInt(this._lastChrysalisStats[0].migrationAddresses, 10);

            embed.addField("Migrated Tokens", `${(totalMigrated / MAX_TOKENS * 100).toFixed(2)} %`);
            embed.addField("Amount Migrated Tokens", `${(totalMigrated / 1000000000000).toFixed(2)} Ti`);

            if (this._lastUsdPrice === 0 || Date.now() - this._lastUsdTime > MS_30_SECONDS) {
                const quotes = await this.updateCmcQuotes("usd");
                this._lastUsdPrice = quotes.data["1720"]?.quote.USD.price;
                this._lastUsdTime = Date.now();
            }

            if (this._lastUsdPrice !== 0) {
                // eslint-disable-next-line new-cap
                const cur = Intl.NumberFormat("en", {
                    style: "currency",
                    currency: "USD"
                }).format((totalMigrated / 1000000) * this._lastUsdPrice);
                embed.addField("Value Migrated", cur);
            }

            embed.addField("Addresses Migrated", totalAddresses);
        }
        return embed;
    }
}
