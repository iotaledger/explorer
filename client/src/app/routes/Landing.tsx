import { convertUnits, Unit } from "@iota/unit-converter";
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import chevronDownGray from "../../assets/chevron-down-gray.svg";
import chevronDownWhite from "../../assets/chevron-down-white.svg";
import { UnitsHelper } from "../../helpers/unitsHelper";
import { ValueFilter } from "../../models/services/valueFilter";
import Feeds from "../components/Feeds";
import "./Landing.scss";
import { LandingProps } from "./LandingProps";
import { LandingState } from "./LandingState";

/**
 * Component which will show the landing page.
 */
class Landing extends Feeds<LandingProps, LandingState> {
    /**
     * Create a new instance of Landing.
     * @param props The props.
     */
    constructor(props: LandingProps) {
        super(props);

        this.state = {
            valueMinimum: "0",
            valueMinimumUnits: Unit.i,
            valueMaximum: "1",
            valueMaximumUnits: Unit.Ti,
            valueFilter: "both",
            transactionsPerSecond: "--",
            transactionsPerSecondHistory: [],
            marketCapEUR: 0,
            marketCapCurrency: "--",
            priceEUR: 0,
            priceCurrency: "--",
            transactions: [],
            milestones: [],
            currency: "USD",
            currencies: [],
            formatFull: false
        };
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        super.componentDidMount();

        const settings = this._settingsService.get();
        this.setState({
            valueMinimum: settings.valueMinimum ?? "0",
            valueMinimumUnits: settings.valueMinimumUnits ?? Unit.i,
            valueMaximum: settings.valueMaximum ?? "1",
            valueMaximumUnits: settings.valueMaximumUnits ?? Unit.Ti,
            valueFilter: settings.valueFilter ?? "both",
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
                            <h2>Searching</h2>
                            <div className="row space-between wrap">
                                <h1>{this.props.networkConfig.label}</h1>
                                {this.props.switcher}
                            </div>
                            <div className="row fill">
                                {this.props.search}
                            </div>
                            <div className="row space-between info-boxes">
                                <div className="info-box">
                                    <span className="info-box--title">Transactions per Second</span>
                                    <span className="info-box--value">{this.state.transactionsPerSecond}</span>
                                    <span className="info-box--action">&nbsp;</span>
                                </div>
                                <div className="info-box">
                                    <Link to="/markets" className="info-box--title linked">
                                        IOTA Market Cap
                                    </Link>
                                    <Link to="/markets" className="info-box--value linked">
                                        {this.state.marketCapCurrency}
                                    </Link>
                                    <span className="info-box--action">
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
                                    </span>
                                </div>
                                <div className="info-box">
                                    <Link to="/markets" className="info-box--title linked">
                                        Price / MI
                                    </Link>
                                    <Link to="/markets" className="info-box--value linked">
                                        {this.state.priceCurrency}
                                    </Link>
                                    <span className="info-box--action">
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
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="wrapper feeds-wrapper">
                    <div className="inner">
                        <div className="feeds-section">
                            <h1>Feeds</h1>
                            <div className="row filters wrap card">
                                <div className="col">
                                    <span className="card--label">Value Filter</span>
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
                                                <option value="both">Both</option>
                                                <option value="zeroOnly">Zero Only</option>
                                                <option value="nonZeroOnly">Non Zero Only</option>
                                            </select>
                                            <img src={chevronDownGray} alt="expand" />
                                        </div>
                                    </span>
                                </div>
                                <div className="col">
                                    <span className="card--label">Minimum</span>
                                    <span className="filter--value">
                                        <div className="select-wrapper">
                                            <select
                                                className="select-plus"
                                                value={this.state.valueMinimumUnits}
                                                onChange={e => this.setState(
                                                    { valueMinimumUnits: e.target.value as Unit },
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
                                    <span className="card--label">&nbsp;</span>
                                    <span className="card--label">To</span>
                                </div>
                                <div className="col">
                                    <span className="card--label">Maximum</span>
                                    <span className="filter--value">
                                        <div className="select-wrapper">
                                            <select
                                                className="select-plus"
                                                value={this.state.valueMaximumUnits}
                                                onChange={e => this.setState(
                                                    { valueMaximumUnits: e.target.value as Unit },
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
                            </div>
                            <div className="row wrap feeds">
                                <div className="feed card">
                                    <div className="card--header">
                                        <h2>{this.props.networkConfig.label} Feed</h2>
                                    </div>
                                    <div className="feed-items">
                                        <div className="row feed-item--header">
                                            <span className="card--label">Amount</span>
                                            <span className="card--label">Transaction</span>
                                        </div>
                                        {this.state.transactions.slice(0, 10).map(tx => (
                                            <div className="row feed-item" key={tx.hash}>
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
                                                        {this.state.formatFull
                                                            ? `${tx.value} i`
                                                            : UnitsHelper.formatBest(tx.value)}
                                                    </button>
                                                </span>
                                                <Link
                                                    className="feed-item--hash"
                                                    to={`/${this.props.networkConfig.network}/transaction/${tx.hash}`}
                                                >
                                                    {tx.hash}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="feed card">
                                    <div className="card--header">
                                        <h2>{this.props.networkConfig.label} Milestones</h2>
                                    </div>
                                    <div className="feed-items">
                                        <div className="row feed-item--header">
                                            <span className="card--label">Milestone</span>
                                            <span className="card--label">Transaction</span>
                                        </div>
                                        {this.state.milestones.slice(0, 10).map(tx => (
                                            <div className="row feed-item" key={tx.hash}>
                                                <span className="feed-item--value">{tx.milestoneIndex}</span>
                                                <Link
                                                    className="feed-item--hash"
                                                    to={`/${this.props.networkConfig.network}/transaction/${tx.hash}`}
                                                >
                                                    {tx.hash}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
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
                        2)
                    : "--"
            });
        }
    }

    /**
     * Filter the transactions and return them.
     * @param transactions The transactions to filter.
     * @returns The filtered transactions.
     */
    protected filterTransactions(transactions: {
        /**
         * The tx hash.
         */
        hash: string;
        /**
         * The tx value.
         */
        value: number;
    }[]): {
        /**
         * The tx hash.
         */
        hash: string;
        /**
         * The tx value.
         */
        value: number;
    }[] {
        if (this._isMounted && this._transactionsClient) {
            const minLimit = convertUnits(this.state.valueMinimum, this.state.valueMinimumUnits, Unit.i);
            const maxLimit = convertUnits(this.state.valueMaximum, this.state.valueMaximumUnits, Unit.i);

            const currentTransactions = this.state.transactions || [];

            return this._transactionsClient.getTransactions()
                .filter(t => currentTransactions.findIndex(t2 => t2.hash === t.hash) < 0)
                .concat(currentTransactions)
                .filter(t => Math.abs(t.value) >= minLimit && Math.abs(t.value) <= maxLimit)
                .filter(t => (this.state.valueFilter === "both" ? true
                    : (this.state.valueFilter === "zeroOnly" ? t.value === 0
                        : t.value !== 0)));
        }

        return [];
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
        if (this._isMounted) {
            const settings = this._settingsService.get();

            settings.valueFilter = this.state.valueFilter;
            settings.valueMinimum = this.state.valueMinimum;
            settings.valueMinimumUnits = this.state.valueMinimumUnits;
            settings.valueMaximum = this.state.valueMaximum;
            settings.valueMaximumUnits = this.state.valueMaximumUnits;

            this._settingsService.save();
        }
    }
}

export default Landing;
