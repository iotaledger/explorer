import React, { ReactNode } from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "~factories/serviceFactory";
import { NumberHelper } from "~helpers/numberHelper";
import { TrytesHelper } from "~helpers/trytesHelper";
import { LEGACY, ProtocolVersion } from "~models/config/protocolVersion";
import { LegacyApiClient } from "~services/legacy/legacyApiClient";
import { LegacyTangleCacheService } from "~services/legacy/legacyTangleCacheService";
import { NetworkService } from "~services/networkService";
import AsyncComponent from "../../components/AsyncComponent";
import Spinner from "../../components/Spinner";
import "../Search.scss";
import { SearchRouteProps } from "../SearchRouteProps";
import { SearchState } from "../SearchState";

/**
 * Component which will show the search page.
 */
class Search extends AsyncComponent<RouteComponentProps<SearchRouteProps>, SearchState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: LegacyTangleCacheService;

    /**
     * API Client for tangle requests.
     */
    private readonly _apiClient: LegacyApiClient;

    /**
     * Create a new instance of Search.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<SearchRouteProps>) {
        super(props);

        const networkService = ServiceFactory.get<NetworkService>("network");
        const protocolVersion: ProtocolVersion =
            (props.match.params.network && networkService.get(props.match.params.network)?.protocolVersion) || LEGACY;
        this._tangleCacheService = ServiceFactory.get<LegacyTangleCacheService>(`tangle-cache-${LEGACY}`);
        this._apiClient = ServiceFactory.get<LegacyApiClient>(`api-client-${LEGACY}`);

        this.state = {
            protocolVersion,
            statusBusy: true,
            status: "",
            completion: "",
            redirect: "",
            invalidError: "",
        };
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        super.componentDidMount();
        window.scrollTo(0, 0);

        this.updateState();
    }

    /**
     * The component was updated.
     * @param prevProps The previous properties.
     */
    public componentDidUpdate(prevProps: RouteComponentProps<SearchRouteProps>): void {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            this.updateState();
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return this.state.redirect ? (
            <Redirect to={this.state.redirect} />
        ) : (
            <div className="search">
                <div className="wrapper">
                    <div className="inner">
                        <h1 className="margin-b-s">Search</h1>
                        {!this.state.completion && this.state.status && (
                            <div className="card">
                                <div className="card--header">
                                    <h2>Searching</h2>
                                </div>
                                <div className="card--content middle row">
                                    {this.state.statusBusy && <Spinner />}
                                    <p className="status">{this.state.status}</p>
                                </div>
                            </div>
                        )}
                        {this.state.completion === "notFound" && (
                            <div className="card">
                                <div className="card--header">
                                    <h2>Not found</h2>
                                </div>
                                <div className="card--content">
                                    <p>We could not find any transactions, bundles, addresses, milestones or tags for the query.</p>
                                    <br />
                                    <div className="card--value">
                                        <ul>
                                            <li>
                                                <span>Query</span>
                                                <span>{this.props.match.params.query}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                        {this.state.completion === "invalid" && (
                            <div className="card">
                                <div className="card--header">
                                    <h2>Incorrect query format</h2>
                                </div>
                                <div className="card--content">
                                    <p className="danger">The supplied hash does not appear to be valid, {this.state.invalidError}.</p>
                                    <br />
                                    <p>The following formats are supported:</p>
                                    <br />
                                    <ul>
                                        <li>
                                            <span>Tags</span>
                                            <span>&lt;= 27 Trytes</span>
                                        </li>
                                        <li>
                                            <span>Transactions</span>
                                            <span>81 Trytes</span>
                                        </li>
                                        <li>
                                            <span>Bundles</span>
                                            <span>81 Trytes</span>
                                        </li>
                                        <li>
                                            <span>Addresses</span>
                                            <span>81 or 90 Trytes</span>
                                        </li>
                                        <li>
                                            <span>Milestone Index</span>
                                            <span>Numeric</span>
                                        </li>
                                    </ul>
                                    <br />
                                    <p>Please perform another search with a valid hash.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Update the state of the component.
     */
    private updateState(): void {
        const query = (this.props.match.params.query ?? "").trim();

        let status = "";
        let statusBusy = false;
        let completion = "";
        let redirect = "";
        let invalidError = "";

        if (query.length > 0) {
            if (NumberHelper.isNumeric(query)) {
                const index = Number(query);
                status = "Searching milestone by index...";
                statusBusy = true;
                if (this._isMounted) {
                    setTimeout(async () => {
                        if (this._isMounted) {
                            const { milestoneHash } = await this._apiClient.milestoneGet({
                                network: this.props.match.params.network,
                                milestoneIndex: index,
                            });

                            if (milestoneHash) {
                                this.setState({
                                    status: "",
                                    statusBusy: false,
                                    redirect: `/${this.props.match.params.network}/transaction/${milestoneHash}`,
                                });
                            } else {
                                this.setState({
                                    completion: "notFound",
                                    status: "",
                                    statusBusy: false,
                                });
                            }
                        }
                    }, 0);
                }
            } else if (TrytesHelper.isTrytes(query)) {
                if (query.length <= 27) {
                    redirect = `/${this.props.match.params.network}/tag/${query}`;
                } else if (query.length === 90) {
                    redirect = `/${this.props.match.params.network}/address/${query}`;
                } else if (query.length === 81) {
                    status = "Detecting hash type...";
                    statusBusy = true;
                    if (this._isMounted) {
                        setTimeout(async () => {
                            if (this._isMounted) {
                                const { hashType } = await this._tangleCacheService.findTransactionHashes(
                                    this.props.match.params.network,
                                    undefined,
                                    query,
                                );

                                if (hashType) {
                                    let ht = "";

                                    if (hashType === "address") {
                                        ht = "address";
                                    } else if (hashType === "bundle") {
                                        ht = "bundle";
                                    } else if (hashType === "tag") {
                                        ht = "tag";
                                    } else if (hashType === "transaction") {
                                        ht = "transaction";
                                    }
                                    this.setState({
                                        status: "",
                                        statusBusy: false,
                                        redirect: `/${this.props.match.params.network}/${ht}/${query}`,
                                    });
                                } else {
                                    this.setState({
                                        completion: "notFound",
                                        status: "",
                                        statusBusy: false,
                                    });
                                }
                            }
                        }, 0);
                    }
                } else {
                    invalidError = `the hash length ${query.length} is not valid`;
                    completion = "invalid";
                }
            } else {
                invalidError = "the hash is not in trytes format";
                completion = "invalid";
            }
        } else {
            invalidError = "the query is empty";
            completion = "invalid";
        }

        this.setState({
            statusBusy,
            status,
            completion,
            redirect,
            invalidError,
        });
    }
}

export default Search;
