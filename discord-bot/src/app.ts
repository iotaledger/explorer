import { Client, MessageEmbed } from "discord.js";
import { FetchHelper } from "./fetchHelper";
import { IStatsGetResponse } from "./models/api/stats/IStatsGetResponse";
import { ICMCQuotesLatestResponse } from "./models/ICMCQuotesLatestResponse";
import { ICoinGeckoPriceResponse } from "./models/ICoinGeckoPriceResponse";
import { IConfiguration } from "./models/IConfiguration";
import { INetworksResponse } from "./models/INetworksResponse";

const COIN_GECKO_URL = "https://api.coingecko.com/api/v3/";
const CMC_URL = "https://pro-api.coinmarketcap.com/v1/";

const MS_30_MINUTES = 30 * 60 * 1000;

const MARKET_TRIGGER = "!m";

export class App {
    private readonly _config: IConfiguration;

    private _botClient: Client;

    private _networks: INetworksResponse | undefined;

    private _timeLastNetworks: number;

    /**
     * Create a new instance of App.
     * @param config The configuration.
     */
    constructor(config: IConfiguration) {
        this._config = config;
        this._timeLastNetworks = 0;
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

                    let embed: MessageEmbed | undefined;

                    if (msg.content === MARKET_TRIGGER ||
                        msg.content.startsWith(`${MARKET_TRIGGER}-`)) {
                        embed = await this.handleMarket(msg.content);
                    } else {
                        const now = Date.now();
                        if (!this._networks || now - this._timeLastNetworks > MS_30_MINUTES) {
                            this._networks = await FetchHelper.json<unknown, INetworksResponse>(
                                this._config.explorerEndpoint,
                                "networks",
                                "get");
                            this._timeLastNetworks = now;
                        }

                        embed = await this.handleNetwork(msg.content);
                    }
                    if (embed) {
                        await msg.channel.send({ embed });
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
        if (this._networks?.networks) {
            const foundNetwork = this._networks?.networks.find(
                n => `!${n.network}` === command && n.isEnabled && !n.isHidden);

            if (foundNetwork) {
                const res = await FetchHelper.json<unknown, IStatsGetResponse>(
                    this._config.explorerEndpoint, `stats/${foundNetwork.network}`, "get");

                let color = foundNetwork.primaryColor;
                let healthReason;
                let health;

                if (res.health === 0) {
                    color = "#ff6755";
                    health = "Bad";
                    healthReason = res.healthReason;
                } else if (res.health === 1) {
                    color = "#ff8b5c";
                    health = "Degraded";
                    healthReason = res.healthReason;
                }

                const embed = new MessageEmbed()
                    .setTitle(foundNetwork.label)
                    .setColor(color)
                    .addField(foundNetwork.protocolVersion === "og"
                        ? "TPS" : "MPS", res.itemsPerSecond, true)
                    .addField(foundNetwork.protocolVersion === "og"
                        ? "CTPS" : "CMPS", res.confirmedItemsPerSecond, true)
                    .addField("Confirmation", `${res.confirmationRate}%`, true)
                    .addField("Latest Milestone Index", res.latestMilestoneIndex ?? "Unknown");

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

        const cmcResponse = await FetchHelper.json<unknown, ICMCQuotesLatestResponse>(
            CMC_URL,
            `cryptocurrency/quotes/latest?id=1720&convert=${convertCurrency}`,
            "get",
            undefined,
            { "X-CMC_PRO_API_KEY": this._config.coinMarketCapKey });

        if (!cmcResponse.data?.["1720"]?.quote[convertCurrencyUpper]) {
            console.error("CMC Response", cmcResponse);
        } else {
            const price = cmcResponse.data["1720"]?.quote[convertCurrencyUpper].price;
            const change1 = cmcResponse.data["1720"]?.quote[convertCurrencyUpper].percent_change_1h;
            const change24 = cmcResponse.data["1720"]?.quote[convertCurrencyUpper].percent_change_24h;
            embed = embed.addField("CoinMarketCap",
                this.formatFiat(price, 3, 8), true)
                .addField("24H Change", `${change24 >= 0 ? "+" : ""}${change24.toFixed(2)}%`, true)
                .addField("1H Change", `${change1 >= 0 ? "+" : ""}${change1.toFixed(2)}%`, true);
            added = true;
        }

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

        if (!added) {
            return new MessageEmbed()
                .setTitle("Market Unknown")
                .setColor("#0fc1b7")
                .addField(":cry:", "I have no data for that currency");
        }

        return embed;
    }
}
