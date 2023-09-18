import { addChecksum } from "@iota/checksum";
import { UnitsHelper } from "@iota/iota.js";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { DateHelper } from "../../../helpers/dateHelper";
import { TrytesHelper } from "../../../helpers/trytesHelper";
import { ICachedTransaction } from "../../../models/api/ICachedTransaction";
import { LEGACY } from "../../../models/config/protocolVersion";
import { LegacyTangleCacheService } from "../../../services/legacy/legacyTangleCacheService";
import { SettingsService } from "../../../services/settingsService";
import AsyncComponent from "../../components/AsyncComponent";
import Confirmation from "../../components/Confirmation";
import CopyButton from "../../components/CopyButton";
import CurrencyButton from "../../components/CurrencyButton";
import Spinner from "../../components/Spinner";
import ValueButton from "../../components/ValueButton";
import { AddressRouteProps } from "./AddressRouteProps";
import { AddressState } from "./AddressState";
import "./Address.scss";

/**
 * Component which will show the address page.
 */
class Address extends AsyncComponent<RouteComponentProps<AddressRouteProps>, AddressState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: LegacyTangleCacheService;

    /**
     * The settings service.
     */
    private readonly _settingsService: SettingsService;

    /**
     * Create a new instance of Address.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<AddressRouteProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<LegacyTangleCacheService>(`tangle-cache-${LEGACY}`);
        this._settingsService = ServiceFactory.get<SettingsService>("settings");

        let address;
        let checksum;
        if ((this.props.match.params.address.length === 81 || this.props.match.params.address.length === 90) &&
            TrytesHelper.isTrytes(this.props.match.params.address)) {
            address = props.match.params.address.slice(0, 81);
            checksum = addChecksum(this.props.match.params.address.slice(0, 81)).slice(-9);
        }

        this.state = {
            statusBusy: 0,
            status: "Finding transactions...",
            formatFull: false,
            address,
            checksum,
            showOnlyValueTransactions: false,
            showOnlyConfirmedTransactions: false
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
                this.props.match.params.network,
                this.props.match.params.address
            );

            this.setState(
                {
                    showOnlyValueTransactions: settings.showOnlyValueTransactions ?? false,
                    showOnlyConfirmedTransactions: settings.showOnlyConfirmedTransactions ?? false,
                    formatFull: settings.formatFull,
                    balance
                },
                async () => {
                    const { txHashes, cursor } = await this._tangleCacheService.findTransactionHashes(
                        this.props.match.params.network,
                        "address",
                        this.props.match.params.address,
                        250
                    );

                    let status = "";

                    if (!txHashes || txHashes.length === 0) {
                        status = "There are no transactions for the requested address.";
                    }

                    const items = txHashes ? txHashes.map(h => ({
                        txHash: h
                    })) : undefined;

                    const filteredItems = this.filterItems(
                        items, settings.showOnlyValueTransactions, settings.showOnlyConfirmedTransactions);

                    this.setState(
                        {
                            items,
                            filteredItems,
                            status,
                            statusBusy: status.length > 0 ? -1 : 1,
                            cursor
                        },
                        async () => {
                            if (txHashes) {
                                const txs = await this._tangleCacheService.getTransactions(
                                    this.props.match.params.network,
                                    txHashes);

                                const bundleConfirmations: { [id: string]: string } = {};

                                for (const tx of txs) {
                                    if (tx.confirmationState === "confirmed") {
                                        bundleConfirmations[tx.tx.bundle] = tx.tx.hash;
                                    }
                                }
                                for (const tx of txs) {
                                    if (tx.confirmationState === "pending" && bundleConfirmations[tx.tx.bundle]) {
                                        tx.confirmationState = "reattachment";
                                    }
                                }

                                const fullItems = txHashes.map((h, idx) => ({
                                    txHash: h,
                                    details: txs[idx]
                                })).sort((itemA, itemB) =>
                                    (DateHelper.milliseconds(itemB.details.tx.timestamp === 0
                                        ? itemB.details.tx.attachmentTimestamp
                                        : itemB.details.tx.timestamp)) -
                                    (DateHelper.milliseconds(itemA.details.tx.timestamp === 0
                                        ? itemA.details.tx.attachmentTimestamp
                                        : itemA.details.tx.timestamp))
                                );

                                this.setState({
                                    items: fullItems,
                                    statusBusy: 2,
                                    filteredItems: this.filterItems(
                                        fullItems,
                                        this.state.showOnlyValueTransactions,
                                        this.state.showOnlyConfirmedTransactions)
                                });
                            }
                        });
                });
        } else {
            this.props.history.replace(`/${this.props.match.params.network}/search/${this.props.match.params.address}`);
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
                                        <div className="card--value row middle">
                                            <span className="margin-r-s">
                                                {this.state.address}
                                                <span className="card--value__light">
                                                    {this.state.checksum}
                                                </span>
                                            </span>
                                            <CopyButton copy={`${this.state.address}${this.state.checksum}`} />
                                        </div>
                                        {this.state.balance !== undefined && this.state.balance !== 0 && (
                                            <div className="row fill margin-t-s margin-b-s value-buttons">
                                                <div className="col">
                                                    <ValueButton value={this.state.balance ?? 0} label="Balance" />
                                                </div>
                                                <div className="col">
                                                    <CurrencyButton
                                                        marketsRoute={`/${this.props.match.params.network}/markets`}
                                                        value={this.state.balance ?? 0}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {this.state.balance !== undefined && this.state.balance === 0 && (
                                            <div>
                                                <div className="card--label">
                                                    Balance
                                                </div>
                                                <div className="card--value">
                                                    0
                                                </div>
                                            </div>
                                        )}
                                        <div className="card--label">
                                            Transaction Filter
                                        </div>
                                        <div className="card--value">
                                            <span>Show Value Transactions Only</span>
                                            <input
                                                type="checkbox"
                                                checked={this.state.showOnlyValueTransactions}
                                                className="margin-l-t"
                                                onChange={e => this.setState(
                                                    {
                                                        showOnlyValueTransactions: e.target.checked,
                                                        filteredItems: this.filterItems(
                                                            this.state.items,
                                                            e.target.checked,
                                                            this.state.showOnlyConfirmedTransactions)
                                                    },
                                                    () => this._settingsService.saveSingle(
                                                        "showOnlyValueTransactions",
                                                        this.state.showOnlyValueTransactions))}
                                            />
                                        </div>
                                        <div className="card--value">
                                            <span>Show Confirmed Only</span>
                                            <input
                                                type="checkbox"
                                                checked={this.state.showOnlyConfirmedTransactions}
                                                className="margin-l-t"
                                                onChange={e => this.setState(
                                                    {
                                                        showOnlyConfirmedTransactions: e.target.checked,
                                                        filteredItems: this.filterItems(
                                                            this.state.items,
                                                            this.state.showOnlyValueTransactions,
                                                            e.target.checked)
                                                    },
                                                    () => this._settingsService.saveSingle(
                                                        "showOnlyConfirmedTransactions",
                                                        this.state.showOnlyConfirmedTransactions))}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {this.state.status && (
                                    <div className="card margin-t-s">
                                        <div className="card--content middle row margin-t-s">
                                            {this.state.statusBusy === 0 && (<Spinner />)}
                                            <p className="status">
                                                {this.state.status}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {!this.state.status && (
                                    <div className="card">
                                        <div className="card--header row space-between">
                                            <div className="row">
                                                <h2>Transactions</h2>
                                                {this.state.items !== undefined &&
                                                    this.state.filteredItems !== undefined && (
                                                        <span className="card--header-count">
                                                            {this.state.filteredItems.length}{
                                                                this.state.cursor?.hasMore && ("+")
                                                            }
                                                        </span>
                                                    )}
                                            </div>
                                            {this.state.statusBusy === 1 && (<Spinner />)}
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
                                            {this.state.filteredItems?.map(item => (
                                                <div className="item-details" key={item.txHash}>
                                                    {item.details && (
                                                        <div
                                                            className="row row--tablet-responsive middle space-between"
                                                        >
                                                            <div className="row middle card--value card--value__large">
                                                                <button
                                                                    type="button"
                                                                    className={classNames(
                                                                        "value",
                                                                        {
                                                                            "value__zero":
                                                                                item.details.tx.value === 0 &&
                                                                                item.details.confirmationState ===
                                                                                "confirmed"
                                                                        },
                                                                        {
                                                                            "value__positive":
                                                                                item.details.tx.value > 0 &&
                                                                                item.details.confirmationState ===
                                                                                "confirmed"
                                                                        },
                                                                        {
                                                                            "value__negative":
                                                                                item.details.tx.value < 0 &&
                                                                                item.details.confirmationState ===
                                                                                "confirmed"
                                                                        },
                                                                        {
                                                                            "value__inprogress":
                                                                                item.details.confirmationState !==
                                                                                "confirmed"
                                                                        }
                                                                    )}
                                                                    onClick={() => this.setState(
                                                                        {
                                                                            formatFull: !this.state.formatFull
                                                                        },
                                                                        () => this._settingsService.saveSingle(
                                                                            "formatFull", this.state.formatFull))}
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
                                                                    DateHelper.milliseconds(
                                                                        item.details.tx.timestamp === 0
                                                                            ? item.details.tx.attachmentTimestamp
                                                                            : item.details.tx.timestamp)
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="card--value">
                                                        <Link
                                                            to={
                                                                `/${this.props.match.params.network
                                                                }/transaction/${item.txHash}`
                                                            }
                                                        >
                                                            {item.txHash}
                                                        </Link>
                                                    </div>
                                                    {item.details && (
                                                        <div className="row middle card--value">
                                                            <Link
                                                                className="card--value__tertiary"
                                                                to={
                                                                    `/${this.props.match.params.network
                                                                    }/bundle/${item.details?.tx.bundle}`
                                                                }
                                                            >
                                                                <span className="material-icons arrow">
                                                                    chevron_right
                                                                </span>
                                                            </Link>
                                                            <Link
                                                                className="card--value__tertiary"
                                                                to={
                                                                    `/${this.props.match.params.network
                                                                    }/bundle/${item.details?.tx.bundle}`
                                                                }
                                                            >
                                                                {item.details.tx.bundle}
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
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
     * @param showOnlyConfirmedTransactions Show only transactions that are confirmed.
     * @returns The filtered items.
     */
    private filterItems(
        items?: {
            /**
             * The transaction hash.
             */
            txHash: string;

            /**
             * The details details.
             */
            details?: ICachedTransaction;
        }[],
        showOnlyValueTransactions?: boolean,
        showOnlyConfirmedTransactions?: boolean
    ): {
        /**
         * The transaction hash.
         */
        txHash: string;

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
                (i.details &&
                    (
                        (i.details.tx.value === 0 && !showOnlyValueTransactions) ||
                        (i.details.tx.value !== 0)
                    ) &&
                    (
                        !showOnlyConfirmedTransactions ||
                        (showOnlyConfirmedTransactions && i.details.confirmationState === "confirmed")
                    )
                )
            );
    }
}

export default Address;
