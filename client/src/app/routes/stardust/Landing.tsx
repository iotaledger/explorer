import { Magnitudes, UnitsHelper } from "@iota/iota.js-stardust";
import classNames from "classnames";
import moment from "moment";
import React, { ReactNode } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { isShimmerNetwork } from "../../../helpers/networkHelper";
import { NumberHelper } from "../../../helpers/numberHelper";
import { RouteBuilder } from "../../../helpers/routeBuilder";
import { INetwork } from "../../../models/config/INetwork";
import { ALPHANET, CUSTOM } from "../../../models/config/networkType";
import { STARDUST } from "../../../models/config/protocolVersion";
import { IFeedItem } from "../../../models/feed/IFeedItem";
import { IFilterSettings } from "../../../models/services/stardust/IFilterSettings";
import { getDefaultValueFilter } from "../../../models/services/valueFilter";
import { NetworkService } from "../../../services/networkService";
import Feeds from "../../components/stardust/Feeds";
import NetworkContext, { INetworkContextProps } from "../../context/NetworkContext";
import "./Landing.scss";
import { LandingRouteProps } from "../LandingRouteProps";
import InfoSection from "./InfoSection";
import { LandingState } from "./LandingState";

/**
 * Component which will show the landing page.
 */
class Landing extends Feeds<RouteComponentProps<LandingRouteProps>, LandingState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * Timer id for seconds since last milestone.
     */
    private _secondsTimer?: NodeJS.Timer;

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
            protocolVersion: STARDUST,
            isEnabled: false
        };

        this.state = {
            networkConfig: network,
            valueMinimum: "",
            valueMinimumMagnitude: "",
            valueMaximum: "",
            valuesFilter: getDefaultValueFilter(network.protocolVersion),
            valueMaximumMagnitude: "",
            itemsPerSecond: "--",
            confirmedItemsPerSecond: "--",
            confirmedItemsPerSecondPercent: "--",
            latestMilestoneIndex: 0,
            latestMilestoneTimestamp: 0,
            secondsSinceLastMilestone: undefined,
            itemsPerSecondHistory: [],
            marketCapEUR: 0,
            marketCapCurrency: "--",
            priceEUR: 0,
            priceCurrency: "--",
            filteredItems: [],
            frozenBlocks: [],
            milestones: [],
            currency: "USD",
            currencies: [],
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
        const { tokenInfo: { decimals } } = this.context as INetworkContextProps;
        const unitMagnitude = UnitsHelper.calculateBest(Math.pow(10, decimals)) ?? "";

        const settings = this._settingsService.get();

        let filterSettings: IFilterSettings | undefined;
        if (this._networkConfig && settings.filters) {
            filterSettings = settings.filters[this._networkConfig.network];
        }

        this.setState({
            valueMinimum: filterSettings?.valueMinimum ?? "0",
            valueMinimumMagnitude: filterSettings?.valueMinimumMagnitude ?? "",
            valueMaximum: filterSettings?.valueMaximum ?? "1000",
            valuesFilter: filterSettings?.valuesFilter ??
                getDefaultValueFilter(this._networkConfig?.protocolVersion ?? "stardust"),
            valueMaximumMagnitude: filterSettings?.valueMaximumMagnitude ?? unitMagnitude,
            formatFull: settings.formatFull
        });

        this.updateSecondsSinceLastMilesone();
    }

    public componentWillUnmount(): void {
        super.componentWillUnmount();
        if (this._secondsTimer) {
            clearInterval(this._secondsTimer);
            this._secondsTimer = undefined;
        }
    }

    private updateSecondsSinceLastMilesone() {
        if (this.state.latestMilestoneTimestamp !== 0) {
            const from = moment(this.state.latestMilestoneTimestamp);
            const to = moment();

            const secondsSinceLastMilestone = to.diff(from, "seconds");

            this.setState({
                secondsSinceLastMilestone
            });
        }

        this._secondsTimer = setInterval(() => this.updateSecondsSinceLastMilesone(), 1000);
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const {
            networkConfig, marketCapCurrency, priceCurrency,
            valuesFilter, formatFull, filteredItems,
            isFeedPaused, isFilterExpanded, itemsPerSecond,
            confirmedItemsPerSecondPercent, latestMilestoneIndex,
            secondsSinceLastMilestone
        } = this.state;

        const { network } = this.props.match.params;
        const isShimmer = isShimmerNetwork(network);

        const defaultInfoBox = (
            <div className="main-info-boxes">
                <div className="info-box">
                    <span className="info-box--title">Blocks per sec
                    </span>
                    <div className="info-box--value">
                        <span className="download-rate">
                            {NumberHelper.roundTo(Number(itemsPerSecond), 1) || "--"}
                        </span>
                    </div>
                </div>
                <div className="info-box">
                    <span className="info-box--title">Inclusion rate</span>
                    <span className="info-box--value">
                        {confirmedItemsPerSecondPercent}
                    </span>
                </div>
                {!isShimmer && networkConfig.showMarket && (
                    <div className="info-box">
                        <span className="info-box--title">IOTA Market Cap</span>
                        <span className="info-box--value">{marketCapCurrency}</span>
                    </div>
                )}
                {!isShimmer && networkConfig.showMarket && (
                    <div className="info-box">
                        <span className="info-box--title">Price / MI</span>
                        <span className="info-box--value">
                            {priceCurrency}
                        </span>
                    </div>
                )}
            </div>
        );

        return (
            <div className="landing-stardust">
                <div className={classNames("header-wrapper", { "shimmer": isShimmer })}>
                    <div className="inner">
                        <div className="header">
                            <div className="header--title">
                                <h2>{networkConfig.isEnabled ? "Explore network" : ""}</h2>
                                <div className="network-name"><h1>{networkConfig.label}</h1></div>
                            </div>
                            {defaultInfoBox}
                        </div>
                    </div>
                    <InfoSection visible={network === ALPHANET} />
                </div>
                <div className={classNames("wrapper feeds-wrapper", { "shimmer": isShimmer })}>
                    <div className="inner">
                        <div className="feeds-section">
                            <div className="row wrap feeds">
                                <div className="feed section">
                                    <div className="feed--metrics row space-between">
                                        <div className="row space-between">
                                            <h3>Latest Milestone Index:</h3>
                                            <span className="metrics-value margin-l-t">{latestMilestoneIndex}</span>
                                        </div>
                                        {secondsSinceLastMilestone !== undefined && (
                                            <div className="row space-between">
                                                <h3>Last:</h3>
                                                <span className="metrics-value margin-l-t">{secondsSinceLastMilestone}s</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="section--header row space-between padding-l-8">
                                        <h2>Latest blocks</h2>
                                        <div className="feed--actions">
                                            <button
                                                className="button--unstyled"
                                                type="button"
                                                onClick={() => {
                                                    this.setState({
                                                        isFeedPaused: !isFeedPaused,
                                                        frozenBlocks: filteredItems
                                                    });
                                                }}
                                            >
                                                {isFeedPaused
                                                    ? <span className="material-icons">play_arrow</span>
                                                    : <span className="material-icons">pause</span>}
                                            </button>
                                            <div className="filters-button-wrapper">
                                                <button
                                                    type="button"
                                                    className="button--unstyled toggle-filters-button"
                                                    onClick={() => {
                                                        this.setState({ isFilterExpanded: !isFilterExpanded });
                                                    }}
                                                >
                                                    <span className="material-icons">tune</span>
                                                </button>
                                                <div className="filters-button-wrapper__counter">
                                                    {valuesFilter.filter(f => f.isEnabled).length}
                                                </div>
                                            </div>
                                            {isFilterExpanded && (
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
                                                            {valuesFilter.map(payload => (
                                                                <React.Fragment key={payload.label}>
                                                                    <label >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={payload.isEnabled}
                                                                            onChange={
                                                                                () => this.toggleFilter(payload.label)
                                                                            }
                                                                        />
                                                                        {payload.label}
                                                                    </label>
                                                                    {networkConfig.protocolVersion ===
                                                                            STARDUST &&
                                                                            payload.label === "Transaction" &&
                                                                            payload.isEnabled && (
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
                                                            this.setState({ isFilterExpanded: !isFilterExpanded });
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="feed-items">
                                        <div className="row feed-item--header">
                                            <span className="label">Block id</span>
                                            <span className="label">Payload Type</span>
                                        </div>
                                        {filteredItems.length === 0 && (
                                            <p>There are no items with the current filter.</p>
                                        )}
                                        {filteredItems.map(item => (
                                            <div className="feed-item" key={item.id}>
                                                <div className="feed-item__content">
                                                    <span className="feed-item--label">Block id</span>
                                                    <Link
                                                        className="feed-item--hash"
                                                        to={RouteBuilder.buildItem(networkConfig, item.id)}
                                                    >
                                                        {item.id}
                                                    </Link>
                                                </div>
                                                <div className="feed-item__content">
                                                    <span className="feed-item--label">Payload Type</span>
                                                    <span className="feed-item--value">
                                                        <button
                                                            type="button"
                                                            onClick={() => this.setState(
                                                                { formatFull: !formatFull },
                                                                () => this._settingsService.saveSingle(
                                                                    "formatFull",
                                                                    formatFull
                                                                )
                                                            )}
                                                        >
                                                            {item.payloadType}
                                                        </button>
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="card margin-t-m">
                                <div className="card--content description">
                                    {networkConfig.description}
                                </div>
                                {networkConfig.faucet && (
                                    <div className="card--content description">
                                        <span>Get tokens from the Faucet:</span>
                                        <a
                                            className="data-link margin-l-t"
                                            href={networkConfig.faucet}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {networkConfig.faucet}
                                        </a>
                                    </div>
                                )}
                            </div>
                            {!networkConfig.isEnabled && (
                                <div className="card margin-t-m">
                                    <div className="card--content description">
                                        {networkConfig.isEnabled === undefined
                                            ? "This network is not recognised."
                                            : "This network is currently disabled in explorer."}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
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
                    this._currencyData.marketCap !== undefined
                        ? this._currencyService.convertFiatBase(
                            this._currencyData.marketCap,
                            this._currencyData,
                            true,
                            2,
                            undefined,
                            true)
                        : "--",
                priceCurrency: this._currencyData.baseCurrencyRate !== undefined
                    ? this._currencyService.convertFiatBase(
                        this._currencyData.baseCurrencyRate,
                        this._currencyData,
                        true,
                        3,
                        8)
                    : "--"
            });
        }
    }

    /**
     * Filter the items and update the feed.
     */
    protected itemsUpdated(items?: IFeedItem[]): void {
        if (this._isMounted && this._feedClient) {
            const minLimit = UnitsHelper.convertUnits(
                Number.parseFloat(this.state.valueMinimum),
                this.state.valueMinimumMagnitude,
                ""
            );
            const maxLimit = UnitsHelper.convertUnits(
                Number.parseFloat(this.state.valueMaximum),
                this.state.valueMaximumMagnitude,
                ""
            );
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
                    payloadType: "Data",
                    filter: (item: IFeedItem) =>
                        item.payloadType === "Data"
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

            const filteredBlocks = this.state.isFeedPaused
                ? this.state.frozenBlocks
                : this._feedClient.getItems();

            this.setState({
                filteredItems: filteredBlocks
                    .filter(item => {
                        let aux = false;
                        for (const f of filters) {
                            const filter = f.filter;
                            if (filter(item)) {
                                aux = true;
                            }
                        }
                        return aux;
                    })
                    .slice(0, 10)
            });
        }

        if (items) {
            items.filter(i => i.payloadType === "MS").forEach(ms => {
                const index: number | undefined = ms.properties?.index as number;
                const currentIndex = this.state.latestMilestoneIndex;
                if (index && currentIndex !== undefined && index > currentIndex) {
                    const timestamp: number | undefined = ms.properties?.timestamp as number;
                    if (timestamp) {
                        this.setState({
                            latestMilestoneIndex: index,
                            latestMilestoneTimestamp: timestamp * 1000
                        });
                    }
                }
            });
        }
    }

    /**
     * Update the minimum filter.
     * @param min The min value from the form.
     */
    private updateMinimum(min: string): void {
        const val = Number.parseFloat(min);

        if (!Number.isNaN(val)) {
            this.setState({ valueMinimum: val.toString() }, async () => this.updateFilters());
        } else {
            this.setState({ valueMinimum: "" });
        }
    }

    /**
     * Update the maximum filter.
     * @param max The max value from the form.
     */
    private updateMaximum(max: string): void {
        const val = Number.parseFloat(max);

        if (!Number.isNaN(val)) {
            this.setState({ valueMaximum: val.toString() }, async () => this.updateFilters());
        } else {
            this.setState({ valueMaximum: "" });
        }
    }

    /**
     * Update the transaction feeds.
     */
    private async updateFilters(): Promise<void> {
        if (this._isMounted && this._networkConfig) {
            const settings = this._settingsService.get();

            settings.filters = settings.filters ?? {};
            settings.filters[this._networkConfig?.network] = {
                valuesFilter: this.state.valuesFilter,
                valueMinimum: this.state.valueMinimum,
                valueMinimumMagnitude: this.state.valueMinimumMagnitude,
                valueMaximum: this.state.valueMaximum,
                valueMaximumMagnitude: this.state.valueMaximumMagnitude
            };

            this._settingsService.save();

            this.itemsUpdated();
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
        const { tokenInfo: { decimals } } = this.context as INetworkContextProps;
        const unitMagnitude = UnitsHelper.calculateBest(Math.pow(10, decimals)) ?? "";

        this.setState({
            valueMinimum: "0",
            valueMinimumMagnitude: "",
            valueMaximum: "1000",
            valueMaximumMagnitude: unitMagnitude,
            valuesFilter: this.state.valuesFilter.map(filter => ({ ...filter, isEnabled: true }))
        }, async () => this.updateFilters());
    }

    private transactionDropdown(type: "minimum" | "maximum"): ReactNode {
        const { tokenInfo: { unit, subunit, decimals } } = this.context as INetworkContextProps;
        const unitMagnitude = UnitsHelper.calculateBest(Math.pow(10, decimals)) ?? "";

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
                            value={
                                type === "minimum"
                                    ? this.state.valueMinimumMagnitude
                                    : this.state.valueMaximumMagnitude
                            }
                            onChange={
                                e =>
                                (type === "minimum" ? this.setState(
                                    {
                                        valueMinimumMagnitude:
                                            e.target.value as Magnitudes
                                    },
                                    async () =>
                                        this.updateFilters()
                                ) : this.setState(
                                    {
                                        valueMaximumMagnitude:
                                            e.target.value as Magnitudes
                                    },
                                    async () =>
                                        this.updateFilters()
                                ))

                            }
                        >
                            {subunit && (
                                <option value="">
                                    {subunit}
                                </option>
                            )}
                            <option value={unitMagnitude}>
                                {unit}
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

