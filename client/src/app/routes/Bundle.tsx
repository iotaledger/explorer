import { isTrytes } from "@iota/validators";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import chevronDownGray from "../../assets/chevron-down-gray.svg";
import chevronLeftGreen from "../../assets/chevron-left-green.svg";
import chevronRightGreen from "../../assets/chevron-right-green.svg";
import { ServiceFactory } from "../../factories/serviceFactory";
import { DateHelper } from "../../helpers/dateHelper";
import { UnitsHelper } from "../../helpers/unitsHelper";
import { ConfirmationState } from "../../models/confirmationState";
import { ICachedTransaction } from "../../models/ICachedTransaction";
import { TangleCacheService } from "../../services/tangleCacheService";
import Confirmation from "../components/Confirmation";
import Currency from "../components/Currency";
import Spinner from "../components/Spinner";
import "./Bundle.scss";
import { BundleRouteProps } from "./BundleRouteProps";
import { BundleState } from "./BundleState";

/**
 * Component which will show the bundle page.
 */
class Bundle extends Currency<RouteComponentProps<BundleRouteProps>, BundleState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * Create a new instance of Bundle.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<BundleRouteProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");

        let bundle;
        if (this.props.match.params.hash.length === 81 &&
            isTrytes(this.props.match.params.hash)) {
            bundle = props.match.params.hash;
        }

        this.state = {
            statusBusy: true,
            status: "Finding transactions...",
            bundle,
            groups: [],
            currency: "USD",
            currencies: [],
            formatFull: false
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        if (this.state.bundle) {
            window.scrollTo(0, 0);

            const { hashes } = await this._tangleCacheService.findTransactionHashes(
                this.props.match.params.network,
                "bundles",
                this.props.match.params.hash,
                250
            );

            const bundleGroupsPlain = await this._tangleCacheService.getBundleGroups(
                this.props.match.params.network,
                hashes
            );

            const confirmationStates = bundleGroupsPlain.map(bg => bg[0].confirmationState);

            const confirmedIndex = confirmationStates.indexOf("confirmed");

            const bundleGroups: {
                /**
                 * The confirmation state for the group.
                 */
                confirmationState: ConfirmationState;

                /**
                 * Timestamp for the group.
                 */
                timestamp: number;

                /**
                 * The transactions in the group.
                 */
                inputs: {
                    /**
                     * The transaction.
                     */
                    details: ICachedTransaction;
                    /**
                     * The value converted.
                     */
                    valueCurrency: string;
                }[];

                /**
                 * The transactions in the group.
                 */
                outputs: {
                    /**
                     * The transaction.
                     */
                    details: ICachedTransaction;
                    /**
                     * The value converted.
                     */
                    valueCurrency: string;
                }[];
            }[] = [];

            for (let i = 0; i < bundleGroupsPlain.length; i++) {
                const isConsistent = bundleGroupsPlain[i].map(tx => tx.tx.value).reduce((a, b) => a + b, 0) === 0;

                let confirmationState: ConfirmationState;
                if (!isConsistent) {
                    confirmationState = "consistency";
                } else if (confirmedIndex === i) {
                    confirmationState = confirmationStates[i];
                } else if (confirmedIndex >= 0 && confirmationStates[i] !== "confirmed") {
                    confirmationState = "reattachment";
                } else {
                    confirmationState = confirmationStates[i];
                }

                let inputAddresses = new Set(bundleGroupsPlain[i]
                    .filter(t => t.tx.value < 0).map(t => t.tx.address));
                const outputAddresses = new Set(bundleGroupsPlain[i]
                    .filter(t => t.tx.value > 0).map(t => t.tx.address));

                if (inputAddresses.size === 0 && inputAddresses.size === 0) {
                    inputAddresses = new Set(bundleGroupsPlain[i].map(t => t.tx.address));
                }

                bundleGroups.push({
                    inputs: bundleGroupsPlain[i]
                        .filter(t => inputAddresses.has(t.tx.address) && t.tx.value <= 0)
                        .map(t => ({
                            details: t,
                            valueCurrency: this._currencyData
                                ? this._currencyService.convertIota(t.tx.value, this._currencyData, true, 2) : ""
                        })),
                    outputs: bundleGroupsPlain[i]
                        .filter(t => outputAddresses.has(t.tx.address) && t.tx.value >= 0)
                        .map(t => ({
                            details: t,
                            valueCurrency: this._currencyData
                                ? this._currencyService.convertIota(t.tx.value, this._currencyData, true, 2) : ""
                        })),
                    timestamp: DateHelper.milliseconds(bundleGroupsPlain[i][0].tx.timestamp === 0
                        ? bundleGroupsPlain[i][0].tx.attachmentTimestamp
                        : bundleGroupsPlain[i][0].tx.timestamp),
                    confirmationState
                });
            }

            this.setState({
                groups: bundleGroups,
                formatFull: this._settingsService.get().formatFull,
                statusBusy: false,
                status: ""
            });
        } else {
            this.props.history.replace(`/${this.props.match.params.network}/search/${this.props.match.params.hash}`);
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="bundle">
                <div className="wrapper">
                    <div className="inner">
                        <h1>Bundle</h1>
                        <div className="row top">
                            <div className="cards">
                                <div className="card">
                                    <div className="card--header card--header__space-between">
                                        <h2>General</h2>
                                        <div className="select-wrapper select-wrapper--small">
                                            <select
                                                value={this.state.currency}
                                                onChange={e => this.setCurrency(e.target.value)}
                                            >
                                                {this.state.currencies.map(cur => (
                                                    <option value={cur} key={cur}>{cur}</option>
                                                ))}
                                            </select>
                                            <img src={chevronDownGray} alt="expand" />
                                        </div>
                                    </div>
                                    <div className="card--content">
                                        <div className="card--label">
                                            Bundle
                                        </div>
                                        <div className="card--value">
                                            {this.state.bundle}
                                        </div>

                                    </div>
                                </div>
                                {this.state.status && (
                                    <div className="card margin-t-s">
                                        <div className="card--content middle row">
                                            {this.state.statusBusy && (<Spinner />)}
                                            <p className="status">
                                                {this.state.status}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {this.state.groups?.map((group, idx) => (
                                    <React.Fragment key={idx}>
                                        <div className="row space-between margin-t-s">
                                            <p>
                                                {DateHelper.format(group.timestamp)}
                                            </p>
                                            <Confirmation state={group.confirmationState} />
                                        </div>
                                        <div className="row top inputs-outputs">
                                            <div className="card">
                                                <div className="card--header">
                                                    <h2>Inputs</h2>
                                                    <span className="card--header-count">{group.inputs.length}</span>
                                                </div>
                                                <div className="card--content">
                                                    {group.inputs.length === 0 && (
                                                        <p>There are no inputs.</p>
                                                    )}
                                                    {group.inputs.map((item, idx2) => (
                                                        <div className="card--row" key={idx2}>
                                                            <div className="row middle space-between card--value">
                                                                <button
                                                                    type="button"
                                                                    className="card--value__large"
                                                                    onClick={() => this.setState(
                                                                        {
                                                                            formatFull: !this.state.formatFull
                                                                        },
                                                                        () => this._settingsService.saveSingle(
                                                                            "formatFull", this.state.formatFull)
                                                                    )}
                                                                >
                                                                    {this.state.formatFull
                                                                        ? `${item.details.tx.value} i`
                                                                        : UnitsHelper.formatBest(item.details.tx.value)}
                                                                </button>
                                                                <span className="card--value__secondary">
                                                                    {item.valueCurrency}
                                                                </span>
                                                            </div>
                                                            <div className="card--value">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => this.props.history.push(
                                                                        `/${this.props.match.params.network
                                                                        }/transaction/${item.details.tx.hash}`)}
                                                                >
                                                                    {item.details.tx.hash}
                                                                </button>
                                                            </div>
                                                            <div className="row middle card--value">
                                                                <img
                                                                    src={chevronLeftGreen}
                                                                    alt="address"
                                                                    className="margin-r-t"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="card--value__tertiary"
                                                                    onClick={() => this.props.history.push(
                                                                        `/${this.props.match.params.network
                                                                        }/address/${item.details.tx.address}`)}
                                                                >
                                                                    {item.details.tx.address}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="card">
                                                <div className="card--header">
                                                    <h2>Outputs</h2>
                                                    <span className="card--header-count">{group.outputs.length}</span>
                                                </div>

                                                <div className="card--content">
                                                    {group.outputs.length === 0 && (
                                                        <p>There are no outputs.</p>
                                                    )}
                                                    {group.outputs.map((item, idx2) => (
                                                        <div className="card--row" key={idx2}>
                                                            <div className="row middle space-between card--value">
                                                                <button
                                                                    type="button"
                                                                    className="card--value__large"
                                                                    onClick={() => this.setState(
                                                                        {
                                                                            formatFull: !this.state.formatFull
                                                                        },
                                                                        () => this._settingsService.saveSingle(
                                                                            "formatFull", this.state.formatFull)
                                                                    )}
                                                                >
                                                                    {this.state.formatFull
                                                                        ? `${item.details.tx.value} i`
                                                                        : UnitsHelper.formatBest(item.details.tx.value)}
                                                                </button>
                                                                <span className="card--value__secondary">
                                                                    {item.valueCurrency}
                                                                </span>
                                                            </div>
                                                            <div className="card--value">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => this.props.history.push(
                                                                        `/${this.props.match.params.network
                                                                        }/transaction/${item.details.tx.hash}`)}
                                                                >
                                                                    {item.details.tx.hash}
                                                                </button>
                                                            </div>
                                                            <div className="row middle card--value">
                                                                <button
                                                                    type="button"
                                                                    className="card--value__tertiary"
                                                                    onClick={() => this.props.history.push(
                                                                        `/${this.props.match.params.network
                                                                        }/address/${item.details.tx.address}`)}
                                                                >
                                                                    {item.details.tx.address}
                                                                </button>
                                                                <img
                                                                    src={chevronRightGreen}
                                                                    alt="address"
                                                                    className="margin-l-t"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
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
            const groups = this.state.groups;

            for (const group of groups) {
                for (const input of group.inputs) {
                    input.valueCurrency = this._currencyService.convertIota(
                        input.details.tx.value, this._currencyData, true, 2);
                }
                for (const output of group.outputs) {
                    output.valueCurrency = this._currencyService.convertIota(
                        output.details.tx.value, this._currencyData, true, 2);
                }
            }

            this.setState({
                groups
            });
        }
    }
}

export default Bundle;
