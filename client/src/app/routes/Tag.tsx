import { isTrytes } from "@iota/validators";
import classNames from "classnames";
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
import SidePanel from "../components/SidePanel";
import Spinner from "../components/Spinner";
import "./Tag.scss";
import { TagRouteProps } from "./TagRouteProps";
import { TagState } from "./TagState";

/**
 * Component which will show the tag page.
 */
class Tag extends AsyncComponent<RouteComponentProps<TagRouteProps>, TagState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * The settings service.
     */
    private readonly _settingsService: SettingsService;

    /**
     * Create a new instance of Tag.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<TagRouteProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");
        this._settingsService = ServiceFactory.get<SettingsService>("settings");

        let tag;
        let tagFill;
        if (this.props.match.params.hash.length <= 27 &&
            isTrytes(this.props.match.params.hash)) {
            tag = props.match.params.hash;
            tagFill = "9".repeat(27 - tag.length);
        }

        this.state = {
            statusBusy: 0,
            status: "Finding transactions...",
            tag,
            tagFill,
            formatFull: false,
            showOnlyValueTransactions: false,
            showOnlyConfirmedTransactions: false
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        if (this.state.tag) {
            window.scrollTo(0, 0);

            const settings = this._settingsService.get();

            this.setState(
                {
                    showOnlyValueTransactions: settings.showOnlyValueTransactions ?? false,
                    showOnlyConfirmedTransactions: settings.showOnlyConfirmedTransactions ?? false,
                    formatFull: settings.formatFull
                },
                async () => {
                    const { totalCount, hashes } = await this._tangleCacheService.findTransactionHashes(
                        this.props.match.params.network,
                        "tags",
                        this.props.match.params.hash
                    );

                    let status = "";

                    if (!hashes || hashes.length === 0) {
                        status = "There are no transactions for the requested tag.";
                    }

                    const items = hashes ? hashes.map(h => ({
                        hash: h
                    })) : undefined;

                    const filteredItems = this.filterItems(
                        items, settings.showOnlyValueTransactions, settings.showOnlyConfirmedTransactions);

                    this.setState(
                        {
                            items,
                            filteredItems,
                            status,
                            statusBusy: status.length > 0 ? -1 : 1,
                            totalCount
                        },
                        async () => {
                            if (hashes) {
                                const txs = await this._tangleCacheService.getTransactions(
                                    this.props.match.params.network,
                                    hashes);

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

                                const fullItems = hashes.map((h, idx) => ({
                                    hash: h,
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
            this.props.history.replace(`/${this.props.match.params.network}/search/${this.props.match.params.hash}`);
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="tag">
                <div className="wrapper">
                    <div className="inner">
                        <h1>Tag</h1>
                        <div className="row top">
                            <div className="cards">
                                <div className="card">
                                    <div className="card--header">
                                        <h2>General</h2>
                                    </div>
                                    <div className="card--content">
                                        <div className="card--label">
                                            Tag
                                        </div>
                                        <div className="card--value">
                                            {this.state.tag}
                                            <span className="card--value__light">
                                                {this.state.tagFill}
                                            </span>

                                        </div>
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
                                        <div className="card--content middle row">
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
                                                            {this.state.filteredItems.length} of {this.state.totalCount}
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
                                                <div className="item-details" key={item.hash}>
                                                    {item.details && (
                                                        <div className="row middle space-between">
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
                                                        <button
                                                            type="button"
                                                            onClick={() => this.props.history.push(
                                                                `/${this.props.match.params.network
                                                                }/transaction/${item.hash}`)}
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
                                                                type="button"
                                                                className="card--value__tertiary"
                                                                onClick={() => this.props.history.push(
                                                                    `/${this.props.match.params.network
                                                                    }/bundle/${item.details?.tx.bundle}`)}
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
                            <SidePanel {...this.props} />
                        </div>
                    </div>
                </div>
            </div>
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
            hash: string;

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

export default Tag;
