import { addChecksum } from "@iota/checksum";
import { isTrytes } from "@iota/validators";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import chevronRightGreen from "../../assets/chevron-right-green.svg";
import { ServiceFactory } from "../../factories/serviceFactory";
import { DateHelper } from "../../helpers/dateHelper";
import { UnitsHelper } from "../../helpers/unitsHelper";
import { ICachedTransaction } from "../../models/ICachedTransaction";
import { SettingsService } from "../../services/settingsService";
import { TangleCacheService } from "../../services/tangleCacheService";
import AsyncComponent from "../components/AsyncComponent";
import Confirmation from "../components/Confirmation";
import CurrencyButton from "../components/CurrencyButton";
import SidePanel from "../components/SidePanel";
import Spinner from "../components/Spinner";
import ValueButton from "../components/ValueButton";
import { NetworkProps } from "../NetworkProps";
import "./Address.scss";
import { AddressRouteProps } from "./AddressRouteProps";
import { AddressState } from "./AddressState";

/**
 * Component which will show the address page.
 */
class Address extends AsyncComponent<RouteComponentProps<AddressRouteProps> & NetworkProps, AddressState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * The settings service.
     */
    private readonly _settingsService: SettingsService;

    /**
     * Create a new instance of Address.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<AddressRouteProps> & NetworkProps) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");
        this._settingsService = ServiceFactory.get<SettingsService>("settings");

        let address;
        let checksum;
        if ((this.props.match.params.hash.length === 81 || this.props.match.params.hash.length === 90) &&
            isTrytes(this.props.match.params.hash)) {
            address = props.match.params.hash.substr(0, 81);
            checksum = addChecksum(this.props.match.params.hash.substr(0, 81)).substr(-9);
        }

        this.state = {
            statusBusy: true,
            status: "Finding transactions...",
            formatFull: false,
            address,
            checksum,
            showOnlyValueTransactions: false
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        if (this.state.address) {
            window.scrollTo(0, 0);

            const settings = this._settingsService.get();

            const balance = await this._tangleCacheService.getAddressBalance(
                this.props.networkConfig,
                this.props.match.params.hash
            );

            this.setState(
                {
                    showOnlyValueTransactions: settings.showOnlyValueTransactions || false,
                    formatFull: settings.formatFull,
                    balance
                },
                async () => {
                    const { hashes, limitExceeded } = await this._tangleCacheService.findTransactionHashes(
                        this.props.networkConfig,
                        "addresses",
                        this.props.match.params.hash
                    );

                    let status = "";

                    if (limitExceeded) {
                        status = "The requested address exceeds the number of items it is possible to retrieve.";
                    } else if (!hashes || hashes.length === 0) {
                        status = "There are no transactions for the requested address.";
                    }

                    const items = hashes ? hashes.map(h => ({
                        hash: h
                    })) : undefined;

                    this.setState(
                        {
                            items,
                            filteredItems: this.filterItems(items, settings.showOnlyValueTransactions),
                            status,
                            statusBusy: false
                        },
                        async () => {
                            if (hashes) {
                                const txs = await this._tangleCacheService.getTransactions(
                                    this.props.networkConfig,
                                    hashes);

                                const bundleConfirmations: { [id: string]: string } = {};

                                for (const tx of txs) {
                                    if (tx.confirmationState === "confirmed") {
                                        bundleConfirmations[tx.tx.bundle] = tx.tx.hash;
                                    }
                                }

                                const fullItems = hashes.map((h, idx) => ({
                                    hash: h,
                                    details: {
                                        ...txs[idx],
                                        confirmationState:
                                            txs[idx].confirmationState === "pending" &&
                                                bundleConfirmations[txs[idx].tx.bundle]
                                                ? "reattachment"
                                                : txs[idx].confirmationState
                                    }
                                })).sort((itemA, itemB) =>
                                    (itemB.details.tx.timestamp === 0
                                        ? itemB.details.tx.attachmentTimestamp
                                        : itemB.details.tx.timestamp * 1000)
                                    -
                                    (itemA.details.tx.timestamp === 0
                                        ? itemA.details.tx.attachmentTimestamp
                                        : itemA.details.tx.timestamp * 1000)
                                );

                                this.setState({
                                    items: fullItems,
                                    filteredItems: this.filterItems(fullItems, this.state.showOnlyValueTransactions)
                                });
                            }
                        });
                });
        } else {
            this.props.history.replace(`/${this.props.networkConfig.network}/search/${this.props.match.params.hash}`);
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="address">
                <div className="wrapper">
                    <div className="inner">
                        <h1>Address</h1>
                        <div className="row top">
                            <div className="cards">
                                <div className="card">
                                    <div className="card--header card--header__space-between">
                                        <h2>General</h2>
                                    </div>
                                    <div className="card--content">
                                        <div className="card--label">
                                            Address
                                        </div>
                                        <div className="card--value">
                                            {this.state.address}
                                            <span className="card--value__light">
                                                {this.state.checksum}
                                            </span>
                                        </div>
                                        <div className="row fill margin-t-s margin-b-s value-buttons">
                                            <div className="col">
                                                <ValueButton value={this.state.balance || 0} label="Balance" />
                                            </div>
                                            <div className="col">
                                                <CurrencyButton value={this.state.balance || 0} />
                                            </div>
                                        </div>
                                        <div className="card--label">
                                            Transaction Filter
                                        </div>
                                        <div className="card--value">
                                            Show Value Transactions Only
                                            <input
                                                type="checkbox"
                                                checked={this.state.showOnlyValueTransactions}
                                                className="margin-l-t"
                                                onChange={e => this.setState(
                                                    {
                                                        showOnlyValueTransactions: e.target.checked,
                                                        filteredItems: this.filterItems(
                                                            this.state.items, e.target.checked)
                                                    },
                                                    () => this._settingsService.saveSingle(
                                                        "showOnlyValueTransactions",
                                                        this.state.showOnlyValueTransactions))}
                                            />
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
                                {!this.state.status && (
                                    <div className="card">
                                        <div className="card--header">
                                            <h2>Transactions</h2>
                                            {this.state.items !== undefined &&
                                                this.state.filteredItems !== undefined && (
                                                    <span className="card--header-count">
                                                        {this.state.filteredItems.length !== this.state.items.length
                                                            && (
                                                                `${this.state.filteredItems.length} of `
                                                            )}
                                                        {this.state.items.length}
                                                    </span>
                                                )}
                                        </div>
                                        <div className="card--content">
                                            {this.state.items &&
                                                this.state.items.length > 0 &&
                                                this.state.filteredItems &&
                                                this.state.filteredItems.length === 0 && (
                                                    <div className="card--value">
                                                        There are no transactions visible with the current filter.
                                                    </div>
                                                )}
                                            {this.state.filteredItems && this.state.filteredItems.map(item => (
                                                <div className="item-details" key={item.hash}>
                                                    {item.details && (
                                                        <div className="row middle space-between">
                                                            <div className="row middle card--value card--value__large">
                                                                <button
                                                                    onClick={() => this.setState(
                                                                        {
                                                                            formatFull: !this.state.formatFull
                                                                        },
                                                                        () => this._settingsService.saveSingle("formatFull", this.state.formatFull))}
                                                                >
                                                                    {this.state.formatFull
                                                                        ? `${item.details.tx.value} i`
                                                                        : UnitsHelper.formatBest(
                                                                            item.details.tx.value)}
                                                                </button>
                                                                <Confirmation
                                                                    state={item.details.confirmationState}
                                                                />
                                                            </div>
                                                            <div className="card--value card--value__light">
                                                                {DateHelper.format(
                                                                    item.details.tx.timestamp === 0
                                                                        ? item.details.tx.attachmentTimestamp
                                                                        : item.details.tx.timestamp * 1000
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="card--value">
                                                        <button
                                                            onClick={() => this.props.history.push(`/${this.props.networkConfig.network}/transaction/${item.hash}`)}
                                                        >
                                                            {item.hash}
                                                        </button>
                                                    </div>
                                                    {item.details && (
                                                        <div className="row middle card--value">
                                                            <img
                                                                src={chevronRightGreen}
                                                                alt="bundle"
                                                                className="margin-r-t"
                                                            />
                                                            <button
                                                                className="card--value__tertiary"
                                                                onClick={() => this.props.history.push(`/${this.props.networkConfig.network}/bundle/${item.details?.tx.bundle}`)}
                                                            >
                                                                {item.details.tx.bundle}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <SidePanel
                                networkConfig={this.props.networkConfig}
                            />
                        </div>
                    </div>
                </div>
            </div >
        );
    }

    /**
     * Filter the items based on the options.
     * @param items The items to filter.
     * @param showOnlyValueTransactions Show only transactions that have a value.
     * @returns The filtered items.
     */
    private filterItems(
        items?: {
            /**
             * The transaction hash.
             */
            hash: string;

            /**
             * The details details.
             */
            details?: ICachedTransaction;
        }[],
        showOnlyValueTransactions?: boolean): {
            /**
             * The transaction hash.
             */
            hash: string;

            /**
             * The details details.
             */
            details?: ICachedTransaction;
        }[] | undefined {
        if (!items) {
            return;
        }
        return items
            .filter(i =>
                !i.details ||
                (i.details && (
                    (i.details.tx.value === 0 && !showOnlyValueTransactions)
                    ||
                    (i.details.tx.value !== 0)
                ))
            );
    }
}

export default Address;
