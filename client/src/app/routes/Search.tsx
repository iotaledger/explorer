import { isTrytes } from "@iota/validators";
import React, { Component, ReactNode } from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../factories/serviceFactory";
import { TangleCacheService } from "../../services/tangleCacheService";
import Spinner from "../components/Spinner";
import "./Search.scss";
import { SearchRouteProps } from "./SearchRouteProps";
import { SearchState } from "./SearchState";

/**
 * Component which will show the search page.
 */
class Search extends Component<RouteComponentProps<SearchRouteProps>, SearchState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * Create a new instance of Search.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<SearchRouteProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");

        this.state = {
            statusBusy: true,
            status: "",
            completion: "",
            redirect: "",
            invalidError: ""
        };
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
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
        )
            : (
                <div className="search">
                    <div className="wrapper">
                        <div className="inner">
                            <h1 className="margin-b-s">
                                Search
                            </h1>
                            {!this.state.completion && this.state.status && (
                                <div className="card">
                                    <div className="card--header">
                                        <h2>Searching</h2>
                                    </div>
                                    <div className="card--content middle row">
                                        {this.state.statusBusy && (<Spinner />)}
                                        <p className="status">
                                            {this.state.status}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {this.state.completion === "notFound" && (
                                <div className="card">
                                    <div className="card--header">
                                        <h2>Not found</h2>
                                    </div>
                                    <div className="card--content">
                                        <p>
                                            We could not find any transactions, bundles, addresses or tags
                                            with the provided hash.
                                        </p>
                                    </div>
                                </div>
                            )}
                            {this.state.completion === "invalid" && (
                                <div className="card">
                                    <div className="card--header">
                                        <h2>Incorrect hash format</h2>
                                    </div>
                                    <div className="card--content">
                                        <p className="danger">
                                            The supplied hash does not appear to be valid, {this.state.invalidError}.
                                        </p>
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
                                                <span>81 Trytes or 90 Trytes</span>
                                            </li>
                                        </ul>
                                        <br />
                                        <p>Please perform another search with a valid hash.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div >
            );
    }

    /**
     * Update the state of the component.
     */
    private updateState(): void {
        const hash = (this.props.match.params.hash ?? "").trim();

        let status = "";
        let statusBusy = false;
        let completion = "";
        let redirect = "";
        let invalidError = "";

        if (hash.length > 0) {
            if (isTrytes(hash)) {
                if (hash.length <= 27) {
                    redirect = `/${this.props.match.params.network}/tag/${hash}`;
                } else if (hash.length === 90) {
                    redirect = `/${this.props.match.params.network}/address/${hash}`;
                } else if (hash.length === 81) {
                    status = "Detecting hash type...";
                    statusBusy = true;
                    setTimeout(
                        async () => {
                            const { hashType } = await this._tangleCacheService.findTransactionHashes(
                                this.props.match.params.network,
                                undefined,
                                hash
                            );

                            if (hashType) {
                                let ht = "";
                                if (hashType === "addresses") {
                                    ht = "address";
                                } else if (hashType === "bundles") {
                                    ht = "bundle";
                                } else if (hashType === "transaction") {
                                    ht = "transaction";
                                }
                                this.setState({
                                    status: "",
                                    statusBusy: false,
                                    redirect: `/${this.props.match.params.network}/${ht}/${hash}`
                                });
                            } else {
                                this.setState({
                                    completion: "notFound",
                                    status: "",
                                    statusBusy: false
                                });
                            }
                        },
                        0);
                } else {
                    invalidError = `the hash length ${hash.length} is not valid`;
                    completion = "invalid";
                }
            } else {
                invalidError = "the hash is not in trytes format";
                completion = "invalid";
            }
        } else {
            invalidError = "the hash is empty";
            completion = "invalid";
        }

        this.setState({
            statusBusy,
            status,
            completion,
            redirect,
            invalidError
        });
    }
}

export default Search;
