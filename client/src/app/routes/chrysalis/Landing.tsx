import { Units, UnitsHelper } from "@iota/iota.js";
import React, { ReactNode } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { LandingState } from "./LandingState";
import { ServiceFactory } from "~factories/serviceFactory";
import { NumberHelper } from "~helpers/numberHelper";
import { RouteBuilder } from "~helpers/routeBuilder";
import { INetwork } from "~models/config/INetwork";
import { CHRYSALIS_MAINNET, CUSTOM } from "~models/config/networkType";
import { CHRYSALIS } from "~models/config/protocolVersion";
import { IFeedItem } from "~models/feed/IFeedItem";
import { getFilterFieldDefaults } from "~models/services/filterField";
import { IFilterSettings } from "~models/services/IFilterSettings";
import { NetworkService } from "~services/networkService";
import Feeds from "../../components/chrysalis/Feeds";
import FeedMilestoneInfo from "../../components/FeedMilestoneInfo";
import { LandingRouteProps } from "../LandingRouteProps";
import "./Landing.scss";

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
            protocolVersion: CHRYSALIS,
            hasStatisticsSupport: false,
            isEnabled: false
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
            isFilterExpanded: false
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
            valuesFilter: filterSettings?.valuesFilter ??
                getFilterFieldDefaults(this._networkConfig?.protocolVersion ?? CHRYSALIS),
            formatFull: settings.formatFull
        });
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        if (this.state.networkConfig.network === CHRYSALIS_MAINNET) {
            return (
                <div className="landing-chrysalis">
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
                                        <div className="info-box">
                                            <span className="info-box--title">Messages per sec
                                            </span>
                                            <div className="info-box--value">
                                                <span className="download-rate">
                                                    {NumberHelper.roundTo(Number(this.state.itemsPerSecond), 1) || "0"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="info-box">
                                            <span className="info-box--title">Inclusion rate</span>
                                            <span className="info-box--value">
                                                {this.state.confirmedItemsPerSecondPercent}
                                            </span>
                                        </div>
                                        {this.state.networkConfig.showMarket && (
                                            <div className="info-box">
                                                <span className="info-box--title">IOTA Market Cap</span>
                                                <span className="info-box--value">{this.state.marketCapCurrency}</span>
                                            </div>
                                        )}
                                        {this.state.networkConfig.showMarket && (
                                            <div className="info-box">
                                                <span className="info-box--title">Price / MI</span>
                                                <span className="info-box--value">
                                                    {this.state.priceCurrency}
                                                </span>
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
                                <div
                                    className="card--value card--value__no-margin description col row middle"
                                    style={{ whiteSpace: "nowrap" }}
                                >
                                    <p>
                                        <span>This network is superseded by </span>
                                        <Link to="/mainnet" className="button">Mainnet (stardust)</Link>.
                                    </p>
                                    <p>
                                        <span>
                                            It can only be used to browse historic data before milestone 7669900
                                        </span>
                                    </p>
                                </div>
                            </div>
                            {
                                !this.state.networkConfig.isEnabled && (
                                    <div className="card margin-t-m">
                                        <div className="card--content description">
                                            {this.state.networkConfig.isEnabled === undefined
                                                ? "This network is not recognised."
                                                : "This network is currently disabled in explorer."}
                                        </div>
                                    </div>
                                )
                            }
                        </div >
                    </div >
                </div >

            );
        }
        const isLatestMilestoneFeedInfoEnabled = this._networkConfig &&
            this._networkConfig.network !== CUSTOM;

        return (
            <div className="landing-chrysalis">
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
                                    <div className="info-box">
                                        <span className="info-box--title">Messages per sec
                                        </span>
                                        <div className="info-box--value">
                                            <span className="download-rate">
                                                {NumberHelper.roundTo(Number(this.state.itemsPerSecond), 1) || "--"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="info-box">
                                        <span className="info-box--title">Inclusion rate</span>
                                        <span className="info-box--value">
                                            {this.state.confirmedItemsPerSecondPercent}
                                        </span>
                                    </div>
                                    {this.state.networkConfig.showMarket && (
                                        <div className="info-box">
                                            <span className="info-box--title">IOTA Market Cap</span>
                                            <span className="info-box--value">{this.state.marketCapCurrency}</span>
                                        </div>
                                    )}
                                    {this.state.networkConfig.showMarket && (
                                        <div className="info-box">
                                            <span className="info-box--title">Price / MI</span>
                                            <span className="info-box--value">
                                                {this.state.priceCurrency}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="wrapper feeds-wrapper">
                    <div className="inner">
                        <div className="feeds-section">
                            <div className="row wrap feeds">
                                <div className="feed section">
                                    <div className="section--header row space-between padding-l-8">
                                        <h2>Latest messages</h2>
                                        <div className="feed--actions">
                                            <button
                                                className="button--unstyled"
                                                type="button"
                                                onClick={() => {
                                                    this.setState({
                                                        isFeedPaused: !this.state.isFeedPaused,
                                                        frozenMessages: this.state.filteredItems
                                                    });
                                                }}
                                            >
                                                {this.state.isFeedPaused
                                                    ? <span className="material-icons">play_arrow</span>
                                                    : <span className="material-icons">pause</span>}
                                            </button>
                                            <div className="filters-button-wrapper">
                                                <button
                                                    type="button"
                                                    className="button--unstyled toggle-filters-button"
                                                    onClick={() => {
                                                        this.setState({
                                                            isFilterExpanded: !this.state.isFilterExpanded
                                                        });
                                                    }}
                                                >
                                                    <span className="material-icons">
                                                        tune
                                                    </span>
                                                </button>
                                                <div className="filters-button-wrapper__counter">
                                                    {this.state.valuesFilter.filter(f => f.isEnabled).length}
                                                </div>
                                            </div>
                                            {this.state.isFilterExpanded && (
                                                <div className="filter-wrapper">
                                                    <div className="filter">
                                                        <div className="filter-header row space-between middle">
                                                            <button
                                                                className="button--unstyled"
                                                                type="button"
                                                                onClick={() => this.resetFilters()}
                                                            >
                                                                Reset
                                                            </button>
                                                            <span>Payload Filter</span>
                                                            <button
                                                                className="done-button"
                                                                type="button"
                                                                onClick={() => this.setState({
                                                                    isFilterExpanded: false
                                                                })}
                                                            >
                                                                Done
                                                            </button>
                                                        </div>

                                                        <div className="filter-content">
                                                            {this.state.valuesFilter.map(payload => (
                                                                <React.Fragment key={payload.label}>
                                                                    <label >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={payload.isEnabled}
                                                                            onChange={
                                                                                () => (
                                                                                    this.toggleFilter(payload.label)
                                                                                )
                                                                            }
                                                                        />
                                                                        {payload.label}
                                                                    </label>
                                                                    {((this.state.networkConfig.protocolVersion ===
                                                                        CHRYSALIS &&
                                                                        payload.label === "Transaction" &&
                                                                        payload.isEnabled)) && (
                                                                            <div className="row">
                                                                                {this.transactionDropdown("minimum")}
                                                                                {this.transactionDropdown("maximum")}
                                                                            </div>
                                                                        )}
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="filter--bg"
                                                        onClick={() => {
                                                            this.setState(
                                                                { isFilterExpanded: !this.state.isFilterExpanded }
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {isLatestMilestoneFeedInfoEnabled && (
                                        <FeedMilestoneInfo
                                            milestoneIndex={this.state.latestMilestoneIndex}
                                            frequencyTarget={this._networkConfig?.milestoneInterval}
                                        />
                                    )}
                                    <div className="feed-items">
                                        <div className="row feed-item--header">
                                            <span className="label">
                                                Message id
                                            </span>
                                            <span className="label">
                                                Payload Type
                                            </span>
                                        </div>
                                        {this.state.filteredItems.length === 0 && (
                                            <p>There are no items with the current filter.</p>
                                        )}
                                        {this.state.filteredItems.map(item => (
                                            <div className="feed-item" key={item.id}>
                                                <div className="feed-item__content">
                                                    <span className="feed-item--label">
                                                        Message id
                                                    </span>
                                                    <Link
                                                        className="feed-item--hash"
                                                        to={RouteBuilder.buildItem(this.state.networkConfig, item.id)}
                                                    >
                                                        {item.id}
                                                    </Link>
                                                </div>
                                                <div className="feed-item__content">
                                                    <span className="feed-item--label">
                                                        Payload Type
                                                    </span>
                                                    <span className="feed-item--value">
                                                        <button
                                                            type="button"
                                                            onClick={() => this.setState(
                                                                {
                                                                    formatFull: !this.state.formatFull
                                                                },
                                                                () => this._settingsService.saveSingle(
                                                                    "formatFull",
                                                                    this.state.formatFull)
                                                            )}
                                                        >
                                                            {item.payloadType}
                                                        </button>
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div >
                            </div >
                            <div className="card margin-t-m">
                                <div className="card--content description">
                                    {this.state.networkConfig.description}
                                </div>
                                {this.state.networkConfig.faucet && (
                                    <div className="card--content description">
                                        <span>Get tokens from the Faucet:</span>
                                        <a
                                            className="data-link margin-l-t"
                                            href={this.state.networkConfig.faucet}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {this.state.networkConfig.faucet}
                                        </a>
                                    </div>
                                )}
                            </div>
                            {
                                !this.state.networkConfig.isEnabled && (
                                    <div className="card margin-t-m">
                                        <div className="card--content description">
                                            {this.state.networkConfig.isEnabled === undefined
                                                ? "This network is not recognised."
                                                : "This network is currently disabled in explorer."}
                                        </div>
                                    </div>
                                )
                            }
                        </div >

                    </div >
                </div >
            </div >
        );
    }

    /**
     * Update formatted currencies.
     */
    protected updateCurrency(): void {
        if (this._currencyData) {
            this.setState({
                marketCapCurrency:
                    this._currencyData.coinStats?.iota?.marketCap ?
                        this._currencyService.convertFiatBase(
                            this._currencyData.coinStats.iota.marketCap,
                            this._currencyData,
                            true,
                            2,
                            undefined,
                            true)
                        : "--",
                priceCurrency: this._currencyData.coinStats?.iota?.price ?
                    this._currencyService.convertFiatBase(
                        this._currencyData.coinStats.iota.price,
                        this._currencyData,
                        true,
                        3,
                        8)
                    : "--"
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
            const minLimit = UnitsHelper.convertUnits(
                Number.parseFloat(this.state.valueMinimum), this.state.valueMinimumUnits, "i");
            const maxLimit = UnitsHelper.convertUnits(
                Number.parseFloat(this.state.valueMaximum), this.state.valueMaximumUnits, "i");

            const filters = [
                {
                    payloadType: "Zero only",
                    filter: (item: IFeedItem) => item.value === 0
                },
                {
                    payloadType: "Non-zero only",
                    filter: (item: IFeedItem) =>
                        item.value !== undefined &&
                        item.value !== 0 &&
                        Math.abs(item.value) >= minLimit &&
                        Math.abs(item.value) <= maxLimit
                },
                {
                    payloadType: "Transaction",
                    filter: (item: IFeedItem) =>
                        item.value !== undefined &&
                        item.value !== 0 &&
                        Math.abs(item.value) >= minLimit &&
                        Math.abs(item.value) <= maxLimit
                },
                {
                    payloadType: "Milestone",
                    filter: (item: IFeedItem) =>
                        item.payloadType === "MS"

                },
                {
                    payloadType: "Indexed",
                    filter: (item: IFeedItem) =>
                        item.payloadType === "Index"
                },
                {
                    payloadType: "No payload",
                    filter: (item: IFeedItem) =>
                        item.payloadType === "None"

                }
            ].filter(f => {
                let aux = false;
                for (const payload of this.state.valuesFilter) {
                    if (f.payloadType === payload.label && payload.isEnabled) {
                        aux = true;
                    }
                }
                return aux;
            });

            const filteredMessages = this.state.isFeedPaused
                ? this.state.frozenMessages
                : this._feedClient.getItems();
            this.setState({
                filteredItems: filteredMessages
                    .filter(item => {
                        let aux = false;
                        for (const f of filters) {
                            const filter = f.filter;
                            if (filter(item)) {
                                aux = true;
                            }
                        }
                        return aux;
                    }
                    )
                    .slice(0, 10)
            });
        }
    }

    /**
     * Update the minimum filter.
     * @param min The min value from the form.
     */
    private updateMinimum(min: string): void {
        const val = Number.parseFloat(min);

        if (Number.isNaN(val)) {
            this.setState({ valueMinimum: "" });
        } else {
            this.setState({ valueMinimum: val.toString() }, async () => this.updateFilters());
        }
    }

    /**
     * Update the maximum filter.
     * @param max The max value from the form.
     */
    private updateMaximum(max: string): void {
        const val = Number.parseFloat(max);

        if (Number.isNaN(val)) {
            this.setState({ valueMaximum: "" });
        } else {
            this.setState({ valueMaximum: val.toString() }, async () => this.updateFilters());
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
                valueMaximumUnits: this.state.valueMaximumUnits
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
        const valuesFilter = this.state.valuesFilter.map(payload => {
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
        this.setState({
            valueMinimum: "0",
            valueMinimumUnits: "i",
            valueMaximum: "1",
            valueMaximumUnits: "Ti",
            valuesFilter: this.state.valuesFilter.map(filter => ({ ...filter, isEnabled: true }))
        }, async () => this.updateFilters());
    }

    private transactionDropdown(type: "minimum" | "maximum"): ReactNode {
        return (
            <div className="col">
                <span className="label margin-b-2">
                    {type === "minimum" ? "Min value" : "Max value"}
                </span>
                <span className="filter--value">
                    <input
                        className="input-plus"
                        type="text"
                        value={type === "minimum" ? this.state.valueMinimum : this.state.valueMaximum}
                        onChange={
                            e =>
                            (type === "minimum"
                                ? this.updateMinimum(e.target.value)
                                : this.updateMaximum(e.target.value)
                            )
                        }
                    />
                    <div className="select-wrapper">
                        <select
                            className="select-plus"
                            value={type === "minimum" ? this.state.valueMinimumUnits : this.state.valueMaximumUnits}
                            onChange={
                                e =>
                                (type === "minimum" ? this.setState(
                                    {
                                        valueMinimumUnits:
                                            e.target.value as Units
                                    },
                                    async () =>
                                        this.updateFilters()
                                ) : this.setState(
                                    {
                                        valueMaximumUnits:
                                            e.target.value as Units
                                    },
                                    async () =>
                                        this.updateFilters()
                                ))

                            }
                        >
                            <option value="i">
                                i
                            </option>
                            <option value="Ki">
                                Ki
                            </option>
                            <option value="Mi">
                                Mi
                            </option>
                            <option value="Gi">
                                Gi
                            </option>
                            <option value="Ti">
                                Ti
                            </option>
                            <option value="Pi">
                                Pi
                            </option>
                        </select>
                        <span className="material-icons">
                            arrow_drop_down
                        </span>
                    </div>
                </span>
            </div>
        );
    }
}


export default Landing;

