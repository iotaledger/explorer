import { isTrytes } from "@iota/validators";
import React, { Component, ReactNode } from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../factories/serviceFactory";
import { TangleCacheService } from "../../services/tangleCacheService";
import { NetworkProps } from "../NetworkProps";
import "./Search.scss";
import { SearchRouteProps } from "./SearchRouteProps";
import { SearchState } from "./SearchState";

/**
 * Component which will show the search page.
 */
class Search extends Component<RouteComponentProps<SearchRouteProps> & NetworkProps, SearchState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * Create a new instance of Search.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<SearchRouteProps> & NetworkProps) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");

        this.state = {
            status: "",
            completion: "",
            redirect: ""
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
    public componentDidUpdate(prevProps: RouteComponentProps<SearchRouteProps> & NetworkProps): void {
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
                            {!this.state.completion && (
                                <p>{this.state.status}</p>
                            )}
                            {this.state.completion === "notFound" && (
                                <React.Fragment>
                                    <h1>Not found</h1>
                                    <p>
                                        We could not find any transactions, bundles, addresses or tags
                                        with the provided hash.
                                    </p>
                                </React.Fragment>
                            )}
                            {this.state.completion === "invalid" && (
                                <React.Fragment>
                                    <h1>Incorrect hash format</h1>
                                    <p className="danger">
                                        The supplied hash does not appear to be valid, {this.state.status}.
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
                                </React.Fragment>
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
        const hash = (this.props.match.params.hash || "").trim();

        let status = "";
        let completion = "";
        let redirect = "";

        if (hash.length > 0) {
            if (isTrytes(hash)) {
                if (hash.length <= 27) {
                    status = "Tag detected, redirecting...";
                    redirect = `/${this.props.networkConfig.network}/tag/${hash}`;
                } else if (hash.length === 90) {
                    status = "Address detected, redirecting...";
                    redirect = `/${this.props.networkConfig.network}/address/${hash}`;
                } else if (hash.length === 81) {
                    status = "Detecting hash type...";
                    setTimeout(
                        async () => {
                            const { hashType } = await this._tangleCacheService.findTransactionHashes(
                                this.props.networkConfig,
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
                                    status: `Detected ${hashType}, redirecting...`,
                                    redirect: `/${this.props.networkConfig.network}/${ht}/${hash}`
                                });
                            } else {
                                this.setState({
                                    completion: "notFound"
                                });
                            }
                        },
                        0);
                } else {
                    status = `the hash length ${hash.length} is not valid`;
                    completion = "invalid";
                }
            } else {
                status = "the hash is not in trytes format";
                completion = "invalid";
            }
        } else {
            status = "the hash is empty";
            completion = "invalid";
        }

        this.setState({
            status,
            completion,
            redirect
        });
    }
}

export default Search;
