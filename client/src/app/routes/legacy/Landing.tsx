import { UnitsHelper } from "@iota/iota.js";
import React, { ReactNode } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { LandingState } from "./LandingState";
import { ServiceFactory } from "~factories/serviceFactory";
import { INetwork } from "~models/config/INetwork";
import { CUSTOM } from "~models/config/networkType";
import { LEGACY } from "~models/config/protocolVersion";
import { IFeedItem } from "~models/feed/IFeedItem";
import { getFilterFieldDefaults } from "~models/services/filterField";
import { IFilterSettings } from "~models/services/IFilterSettings";
import { NetworkService } from "~services/networkService";
import Feeds from "../../components/legacy/Feeds";
import "./Landing.scss";
import { LandingRouteProps } from "../LandingRouteProps";

/**
 * Component which will show the landing page.
 */
class Landing extends Feeds<RouteComponentProps<LandingRouteProps>, LandingState> {
    /**
     * Create a new instance of Landing.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<LandingRouteProps>) {
        super(props);

        const networkService = ServiceFactory.get<NetworkService>("network");
        const network: INetwork = (props.match.params.network && networkService.get(props.match.params.network)) || {
            label: "Custom network",
            network: CUSTOM,
            protocolVersion: LEGACY,
            hasStatisticsSupport: false,
            isEnabled: false,
        };

        this.state = {
            networkConfig: network,
            valueMinimum: "0",
            valueMinimumUnits: "i",
            valueMaximum: "1",
            valueMaximumUnits: "Ti",
            valuesFilter: getFilterFieldDefaults(network.protocolVersion),
            itemsPerSecond: "--",
            confirmedItemsPerSecond: "--",
            confirmedItemsPerSecondPercent: "--",
            itemsPerSecondHistory: [],
            marketCapEUR: 0,
            marketCapCurrency: "--",
            priceEUR: 0,
            priceCurrency: "--",
            filteredItems: [],
            frozenMessages: [],
            currency: "USD",
            formatFull: false,
            isFeedPaused: false,
            isFilterExpanded: false,
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        await super.componentDidMount();

        const settings = this._settingsService.get();

        let filterSettings: IFilterSettings | undefined;

        if (this._networkConfig && settings.filters) {
            filterSettings = settings.filters[this._networkConfig.network];
        }

        this.setState({
            valueMinimum: filterSettings?.valueMinimum ?? "0",
            valueMinimumUnits: filterSettings?.valueMinimumUnits ?? "i",
            valueMaximum: filterSettings?.valueMaximum ?? "3",
            valueMaximumUnits: filterSettings?.valueMaximumUnits ?? "Pi",
            valuesFilter: filterSettings?.valuesFilter ?? getFilterFieldDefaults(this._networkConfig?.protocolVersion ?? LEGACY),
            formatFull: settings.formatFull,
        });
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="landing-legacy">
                <div className="wrapper header-wrapper">
                    <div className="inner">
                        <div className="header">
                            <div className="header--title">
                                <h2>{this.state.networkConfig.isEnabled ? "Explore network" : ""}</h2>
                                <div className="row space-between wrap">
                                    <h1>{this.state.networkConfig.label}</h1>
                                </div>
                            </div>
                            {this.state.networkConfig.isEnabled && (
                                <div className="row space-between info-boxes">
                                    {this.state.networkConfig.showMarket && (
                                        <div className="info-box">
                                            <span className="info-box--title">IOTA Market Cap</span>
                                            <span className="info-box--value">{this.state.marketCapCurrency}</span>
                                        </div>
                                    )}
                                    {this.state.networkConfig.showMarket && (
                                        <div className="info-box">
                                            <span className="info-box--title">Price / MI</span>
                                            <span className="info-box--value">{this.state.priceCurrency}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="wrapper feeds-wrapper">
                    <div className="inner">
                        <div className="card margin-t-m">
                            <div className="card--value card--value__no-margin description col row middle" style={{ whiteSpace: "nowrap" }}>
                                <p>
                                    <span>This network is superseded by </span>
                                    <Link to="/chrysalis-mainnet" className="button">
                                        Chrysalis (archive)
                                    </Link>
                                    <span> and </span>
                                    <Link to="/mainnet" className="button">
                                        Mainnet (stardust)
                                    </Link>
                                    .
                                </p>
                                <p>
                                    <span>It can only be used to browse historic data before milestone 4984942</span>
                                </p>
                            </div>
                        </div>
                        {!this.state.networkConfig.isEnabled && (
                            <div className="card margin-t-m">
                                <div className="card--content description">
                                    {this.state.networkConfig.isEnabled === undefined
                                        ? "This network is not recognised."
                                        : "This network is currently disabled in explorer."}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Update formatted currencies.
     */
    protected updateCurrency(): void {
        if (this._currencyData) {
            this.setState({
                marketCapCurrency: this._currencyData.coinStats?.iota?.marketCap
                    ? this._currencyService.convertFiatBase(
                          this._currencyData.coinStats.iota.marketCap,
                          this._currencyData,
                          true,
                          2,
                          undefined,
                          true,
                      )
                    : "--",
                priceCurrency: this._currencyData.coinStats?.iota?.price
                    ? this._currencyService.convertFiatBase(this._currencyData.coinStats.iota.price, this._currencyData, true, 3, 8)
                    : "--",
            });
        }
    }

    /**
     * The items have been updated.
     * @param newItems The updated items.
     */
    protected itemsUpdated(newItems: IFeedItem[]): void {
        super.itemsUpdated(newItems);
        this.applyFilters();
    }

    /**
     * Filter the items and update the feed.
     */
    private applyFilters(): void {
        if (this._isMounted && this._feedClient) {
            const minLimit = UnitsHelper.convertUnits(Number.parseFloat(this.state.valueMinimum), this.state.valueMinimumUnits, "i");
            const maxLimit = UnitsHelper.convertUnits(Number.parseFloat(this.state.valueMaximum), this.state.valueMaximumUnits, "i");

            const filters = [
                {
                    payloadType: "Zero only",
                    filter: (item: IFeedItem) => item.value === 0,
                },
                {
                    payloadType: "Non-zero only",
                    filter: (item: IFeedItem) =>
                        item.value !== undefined &&
                        item.value !== 0 &&
                        Math.abs(item.value) >= minLimit &&
                        Math.abs(item.value) <= maxLimit,
                },
                {
                    payloadType: "Transaction",
                    filter: (item: IFeedItem) =>
                        item.value !== undefined &&
                        item.value !== 0 &&
                        Math.abs(item.value) >= minLimit &&
                        Math.abs(item.value) <= maxLimit,
                },
                {
                    payloadType: "Milestone",
                    filter: (item: IFeedItem) => item.payloadType === "MS",
                },
                {
                    payloadType: "Indexed",
                    filter: (item: IFeedItem) => item.payloadType === "Index",
                },
                {
                    payloadType: "No payload",
                    filter: (item: IFeedItem) => item.payloadType === "None",
                },
            ].filter((f) => {
                let aux = false;
                for (const payload of this.state.valuesFilter) {
                    if (f.payloadType === payload.label && payload.isEnabled) {
                        aux = true;
                    }
                }
                return aux;
            });

            const filteredMessages = this.state.isFeedPaused ? this.state.frozenMessages : this._feedClient.getItems();
            this.setState({
                filteredItems: filteredMessages
                    .filter((item) => {
                        let aux = false;
                        for (const f of filters) {
                            const filter = f.filter;
                            if (filter(item)) {
                                aux = true;
                            }
                        }
                        return aux;
                    })
                    .slice(0, 10),
            });
        }
    }

    /**
     * Update the transaction feeds.
     */
    private async updateFilters(): Promise<void> {
        if (this._isMounted && this._networkConfig) {
            const settings = this._settingsService.get();

            settings.filters ??= {};
            settings.filters[this._networkConfig?.network] = {
                valuesFilter: this.state.valuesFilter,
                valueMinimum: this.state.valueMinimum,
                valueMinimumUnits: this.state.valueMinimumUnits,
                valueMaximum: this.state.valueMaximum,
                valueMaximumUnits: this.state.valueMaximumUnits,
            };

            this._settingsService.save();

            this.applyFilters();
        }
    }

    /**
     * Enable or disable the payload type to show in feed.
     * @param payloadType The payload type to toggle.
     */
    private toggleFilter(payloadType: string): void {
        const valuesFilter = this.state.valuesFilter.map((payload) => {
            if (payload.label === payloadType) {
                payload.isEnabled = !payload.isEnabled;
            }
            return payload;
        });
        this.setState({ valuesFilter }, async () => this.updateFilters());
    }

    /**
     * Reset filters to default values
     */
    private resetFilters(): void {
        this.setState(
            {
                valueMinimum: "0",
                valueMinimumUnits: "i",
                valueMaximum: "1",
                valueMaximumUnits: "Ti",
                valuesFilter: this.state.valuesFilter.map((filter) => ({ ...filter, isEnabled: true })),
            },
            async () => this.updateFilters(),
        );
    }
}

export default Landing;
