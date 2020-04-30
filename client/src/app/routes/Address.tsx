import { addChecksum } from "@iota/checksum";
import { isTrytes } from "@iota/validators";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import chevronRightGreen from "../../assets/chevron-right-green.svg";
import { ServiceFactory } from "../../factories/serviceFactory";
import { DateHelper } from "../../helpers/dateHelper";
import { UnitsHelper } from "../../helpers/unitsHelper";
import { TangleCacheService } from "../../services/tangleCacheService";
import AsyncComponent from "../components/AsyncComponent";
import Confirmation from "../components/Confirmation";
import CurrencyButton from "../components/CurrencyButton";
import SidePanel from "../components/SidePanel";
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
     * Create a new instance of Address.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<AddressRouteProps> & NetworkProps) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");

        let address;
        let checksum;
        if ((this.props.match.params.hash.length === 81 || this.props.match.params.hash.length === 90) &&
            isTrytes(this.props.match.params.hash)) {
            address = props.match.params.hash.substr(0, 81);
            checksum = addChecksum(this.props.match.params.hash.substr(0, 81)).substr(-9);
        }

        this.state = {
            status: "Finding transactions...",
            formatFull: false,
            address,
            checksum
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        if (this.state.address) {
            window.scrollTo(0, 0);

            const balance = await this._tangleCacheService.getAddressBalance(
                this.props.networkConfig,
                this.props.match.params.hash
            );

            this.setState(
                {
                    balance
                },
                async () => {
                    const { hashes, totalCount, limitExceeded } = await this._tangleCacheService.findTransactionHashes(
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

                    this.setState(
                        {
                            items: hashes ? hashes.map(h => ({
                                hash: h
                            })) : undefined,
                            totalCount: limitExceeded ? undefined :
                                hashes.length < totalCount ? `${hashes.length} of ${totalCount}` : `${hashes.length}`,
                            status
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

                                this.setState({
                                    items: hashes.map((h, idx) => ({
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
                                        itemB.details.tx.attachmentTimestamp - itemA.details.tx.attachmentTimestamp)
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
                                        <div className="card--label">
                                            Balance
                                        </div>
                                        <div className="row fill space-between margin-t-s margin-b-s">
                                            <div className="col fill">
                                                <ValueButton value={this.state.balance || 0} />
                                            </div>
                                            <div className="col fill">
                                                <CurrencyButton value={this.state.balance || 0} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {this.state.status && (
                                    <p className="status margin-t-s">
                                        {this.state.status}
                                    </p>
                                )}
                                {!this.state.status && (
                                    <div className="card">
                                        <div className="card--header">
                                            <h2>Transactions</h2>
                                            {this.state.totalCount !== undefined && (
                                                <span className="card--header-count">{this.state.totalCount}</span>
                                            )}
                                        </div>
                                        <div className="card--content">
                                            {this.state.items && this.state.items.map(item => (
                                                <div className="item-details" key={item.hash}>
                                                    {item.details && (
                                                        <div className="row middle space-between">
                                                            <div className="row middle card--value card--value__large">
                                                                <button
                                                                    onClick={() => this.setState({
                                                                        formatFull: !this.state.formatFull
                                                                    })}
                                                                >
                                                                    {this.state.formatFull
                                                                        ? `${item.details.tx.value} i`
                                                                        : UnitsHelper.formatBest(item.details.tx.value)}
                                                                </button>
                                                                <Confirmation
                                                                    state={item.details.confirmationState}
                                                                />
                                                            </div>
                                                            <div className="card--value card--value__light">
                                                                {DateHelper.format(item.details.tx.attachmentTimestamp)}
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
}

export default Address;
