import { Units, UnitsHelper } from "@iota/iota.js";
import React, { ReactNode } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import chevronDownGray from "../../assets/chevron-down-gray.svg";
import { ServiceFactory } from "../../factories/serviceFactory";
import { RouteBuilder } from "../../helpers/routeBuilder";
import { INetwork } from "../../models/db/INetwork";
import { IFeedItem } from "../../models/IFeedItem";
import { IFilterSettings } from "../../models/services/IFilterSettings";
import { ValueFilter } from "../../models/services/valueFilter";
import { NetworkService } from "../../services/networkService";
import Feeds from "../components/Feeds";
import "./Landing.scss";
import { LandingProps } from "./LandingProps";
import { LandingRouteProps } from "./LandingRouteProps";
import { LandingState } from "./LandingState";

/**
 * Component which will show the landing page.
 */
class Landing extends Feeds<RouteComponentProps<LandingRouteProps> & LandingProps, LandingState> {
    /**
     * Create a new instance of Landing.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<LandingRouteProps> & LandingProps) {
        super(props);

        const networkService = ServiceFactory.get<NetworkService>("network");
        const network: INetwork = (props.match.params.network && networkService.get(props.match.params.network)) || {
            label: "Unknown Network",
            network: "unknown",
            protocolVersion: "og",
            isEnabled: false,
            order: 9999999
        };

        this.state = {
            networkConfig: network,
            valueMinimum: "0",
            valueMinimumUnits: "i",
            valueMaximum: "1",
            valueMaximumUnits: "Ti",
            valueFilter: "all",
            itemsPerSecond: "--",
            confirmedItemsPerSecond: "--",
            confirmedItemsPerSecondPercent: "--",
            itemsPerSecondHistory: [],
            marketCapEUR: 0,
            marketCapCurrency: "--",
            priceEUR: 0,
            priceCurrency: "--",
            filteredItems: [],
            milestones: [],
            currency: "USD",
            currencies: [],
            formatFull: false
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
            valueFilter: filterSettings?.valueFilter ?? "all",
            formatFull: settings.formatFull
        });
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="landing">
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
                                        <span className="info-box--title">{
                                            this.state.networkConfig.protocolVersion === "og"
                                                ? "Transactions"
                                                : "Messages"
                                        } per sec
                                        </span>
                                        <span className="info-box--value">
                                            {this.state.itemsPerSecond} / {
                                                this.state.confirmedItemsPerSecond
                                            }
                                        </span>
                                        {/* <span className="info-box--action info-box--action__labelvalue">
                                            <span className="info-box--action__label margin-l-t margin-r-t">
                                                {this._networkConfig?.protocolVersion === "chrysalis"
                                                    ? "Referenced Rate:" : "Confirmation Rate:"}
                                            </span>
                                            <span className="info-box--action__value margin-r-t">
                                                {this.state.confirmedItemsPerSecondPercent}
                                            </span>
                                        </span> */}
                                    </div>
                                    {this.state.networkConfig.showMarket && (
                                        <div className="info-box">
                                            {/* <Link
                                                to={`/${this.props.match.params.network}/markets`}
                                                className="info-box--title linked"
                                            >
                                                IOTA Market Cap
                                            </Link>
                                            <Link
                                                to={`/${this.props.match.params.network}/markets`}
                                                className="info-box--value linked"
                                            >
                                                {this.state.marketCapCurrency}
                                            </Link> */}
                                            <span className="info-box--title">IOTA Market Cap</span>
                                            <span className="info-box--value">{this.state.marketCapCurrency}</span>
                                            {/* <span className="info-box--action">
                                                <div className="select-wrapper select-wrapper--small">
                                                    <select
                                                        value={this.state.currency}
                                                        onChange={e => this.setCurrency(e.target.value)}
                                                    >
                                                        {this.state.currencies.map(cur => (
                                                            <option value={cur} key={cur}>{cur}</option>
                                                        ))}
                                                    </select>
                                                    <img src={chevronDownWhite} alt="expand" />
                                                </div>
                                            </span> */}
                                        </div>
                                    )}
                                    {this.state.networkConfig.showMarket && (
                                        <div className="info-box">
                                            <span className="info-box--title">Price / MI</span>
                                            <span className="info-box--value">{this.state.priceCurrency}</span>
                                            {/* <Link
                                                to={`/${this.props.match.params.network}/markets`}
                                                className="info-box--title linked"
                                            >
                                                Price / MI
                                            </Link>
                                            
                                            <Link
                                                to={`/${this.props.match.params.network}/markets`}
                                                className="info-box--value linked"
                                            >
                                                {this.state.priceCurrency}
                                            </Link> */}
                                            {/* <span className="info-box--action">
                                                <div className="select-wrapper select-wrapper--small">
                                                    <select
                                                        value={this.state.currency}
                                                        onChange={e => this.setCurrency(e.target.value)}
                                                    >
                                                        {this.state.currencies.map(cur => (
                                                            <option value={cur} key={cur}>{cur}</option>
                                                        ))}
                                                    </select>
                                                    <img src={chevronDownWhite} alt="expand" />
                                                </div>
                                            </span> */}
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
                            <h1>Feeds</h1>
                            {this.state.networkConfig.isEnabled &&
                                (
                                    <div className="row filters wrap section">
                                        <div className="col">
                                            <span className="section--label">
                                                {this._networkConfig?.protocolVersion === "og"
                                                    ? "Value" : "Payload"} Filter
                                            </span>
                                            <span className="filter--value">
                                                <div className="select-wrapper">
                                                    <select
                                                        value={this.state.valueFilter}
                                                        onChange={e => this.setState(
                                                            {
                                                                valueFilter: e.target.value as ValueFilter
                                                            },
                                                            async () => this.updateFilters())}
                                                    >
                                                        <option value="all">All</option>
                                                        {this._networkConfig?.protocolVersion === "og" && (
                                                            <React.Fragment>
                                                                <option value="zeroOnly">Zero Only</option>
                                                                <option value="nonZeroOnly">Non Zero Only</option>
                                                            </React.Fragment>
                                                        )}
                                                        {this._networkConfig?.protocolVersion === "chrysalis" && (
                                                            <React.Fragment>
                                                                <option value="transaction">Transaction</option>
                                                                <option value="milestone">Milestone</option>
                                                                <option value="indexed">Indexed</option>
                                                                <option value="noPayload">No Payload</option>
                                                            </React.Fragment>
                                                        )}
                                                    </select>
                                                    <img src={chevronDownGray} alt="expand" />
                                                </div>
                                            </span>
                                        </div>
                                        {this.state.valueFilter !== "zeroOnly" &&
                                            this.state.valueFilter !== "milestone" &&
                                            this.state.valueFilter !== "indexed" &&
                                            this.state.valueFilter !== "noPayload" && (
                                                <React.Fragment>
                                                    <div className="col">
                                                        <span className="section--label">Minimum</span>
                                                        <span className="filter--value">
                                                            <div className="select-wrapper">
                                                                <select
                                                                    className="select-plus"
                                                                    value={this.state.valueMinimumUnits}
                                                                    onChange={e => this.setState(
                                                                        { valueMinimumUnits: e.target.value as Units },
                                                                        async () => this.updateFilters())}
                                                                >
                                                                    <option value="i">i</option>
                                                                    <option value="Ki">Ki</option>
                                                                    <option value="Mi">Mi</option>
                                                                    <option value="Gi">Gi</option>
                                                                    <option value="Ti">Ti</option>
                                                                    <option value="Pi">Pi</option>
                                                                </select>
                                                                <img src={chevronDownGray} alt="expand" />
                                                            </div>
                                                            <input
                                                                className="input-plus"
                                                                type="text"
                                                                value={this.state.valueMinimum}
                                                                onChange={e => this.updateMinimum(e.target.value)}
                                                            />
                                                        </span>
                                                    </div>
                                                    <div className="col">
                                                        <span className="section--label">&nbsp;</span>
                                                        <span className="section--label margin-b-t">To</span>
                                                    </div>
                                                    <div className="col">
                                                        <span className="section--label">Maximum</span>
                                                        <span className="filter--value">
                                                            <div className="select-wrapper">
                                                                <select
                                                                    className="select-plus"
                                                                    value={this.state.valueMaximumUnits}
                                                                    onChange={e => this.setState(
                                                                        { valueMaximumUnits: e.target.value as Units },
                                                                        async () => this.updateFilters())}
                                                                >
                                                                    <option value="i">i</option>
                                                                    <option value="Ki">Ki</option>
                                                                    <option value="Mi">Mi</option>
                                                                    <option value="Gi">Gi</option>
                                                                    <option value="Ti">Ti</option>
                                                                    <option value="Pi">Pi</option>
                                                                </select>
                                                                <img src={chevronDownGray} alt="expand" />
                                                            </div>
                                                            <input
                                                                className="input-plus"
                                                                type="text"
                                                                value={this.state.valueMaximum}
                                                                onChange={e => this.updateMaximum(e.target.value)}
                                                            />
                                                        </span>
                                                    </div>
                                                </React.Fragment>
                                            )}
                                    </div>
                                )}
                            <div className="row wrap feeds">
                                <div className="feed section">
                                    <div className="section--header">
                                        <h2>Latest messages</h2>
                                        {/* <h2>{this.state.networkConfig.label} Feed</h2> */}
                                    </div>
                                    <div className="feed-items">
                                        <div className="row feed-item--header">
                                            <span className="section--label">
                                                {this.state.networkConfig.protocolVersion === "og"
                                                    ? "Transaction" : "Message id"}
                                            </span>
                                            <span className="section--label">
                                                {this.state.networkConfig.protocolVersion === "og"
                                                    ? "Amount" : "Payload Type"}
                                            </span>
                                        </div>
                                        {this.state.filteredItems.length === 0 && (
                                            <p>There are no items with the current filter.</p>
                                        )}
                                        {this.state.filteredItems.map(item => (
                                            <div className=" feed-item" key={item.id}>
                                                <div className="feed-item__content">
                                                    <span className="feed-item--label">
                                                        {this.state.networkConfig.protocolVersion === "og"
                                                            ? "Transaction" : "Message id"}
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
                                                        {this.state.networkConfig.protocolVersion === "og"
                                                            ? "Amount" : "Payload Type"}
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
                                </div>
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
                marketCapCurrency:
                    this._currencyData.marketCap !== undefined
                        ? this._currencyService.convertFiatBase(
                            this._currencyData.marketCap,
                            this._currencyData,
                            true,
                            0)
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
    protected itemsUpdated(): void {
        if (this._isMounted && this._feedClient) {
            const minLimit = UnitsHelper.convertUnits(
                Number.parseFloat(this.state.valueMinimum), this.state.valueMinimumUnits, "i");
            const maxLimit = UnitsHelper.convertUnits(
                Number.parseFloat(this.state.valueMaximum), this.state.valueMaximumUnits, "i");

            let filter = (item: IFeedItem) =>
                item.value === undefined ||
                (item.value !== undefined &&
                    Math.abs(item.value) >= minLimit &&
                    Math.abs(item.value) <= maxLimit);

            if (this.state.valueFilter === "zeroOnly") {
                filter = (item: IFeedItem) => item.value === 0;
            } else if (this.state.valueFilter === "nonZeroOnly" || this.state.valueFilter === "transaction") {
                filter = (item: IFeedItem) =>
                    item.value !== undefined &&
                    item.value !== 0 &&
                    Math.abs(item.value) >= minLimit &&
                    Math.abs(item.value) <= maxLimit;
            } else if (this.state.valueFilter === "milestone") {
                filter = (item: IFeedItem) =>
                    item.payloadType === "MS";
            } else if (this.state.valueFilter === "indexed") {
                filter = (item: IFeedItem) =>
                    item.payloadType === "Index";
            } else if (this.state.valueFilter === "noPayload") {
                filter = (item: IFeedItem) =>
                    item.payloadType === "None";
            }

            this.setState({
                filteredItems: this._feedClient.getItems()
                    .filter(item => filter(item))
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
                valueFilter: this.state.valueFilter,
                valueMinimum: this.state.valueMinimum,
                valueMinimumUnits: this.state.valueMinimumUnits,
                valueMaximum: this.state.valueMaximum,
                valueMaximumUnits: this.state.valueMaximumUnits
            };

            this._settingsService.save();

            this.itemsUpdated();
        }
    }
}

export default Landing;
