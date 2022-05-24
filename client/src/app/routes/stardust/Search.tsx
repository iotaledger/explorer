import React, { ReactNode } from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ProtocolVersion, STARDUST } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
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
    private readonly _tangleCacheService: StardustTangleCacheService;

    /**
     * Create a new instance of Search.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<SearchRouteProps>) {
        super(props);

        const networkService = ServiceFactory.get<NetworkService>("network");
        const protocolVersion: ProtocolVersion = (props.match.params.network &&
            networkService.get(props.match.params.network)?.protocolVersion) || STARDUST;

        this._tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);

        this.state = {
            protocolVersion,
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
                                        {this.state.protocolVersion === STARDUST && (
                                            <React.Fragment>
                                                <p>
                                                    We could not find any messages, addresses, outputs, milestones
                                                    or indexes for the query.
                                                </p>
                                                <br />
                                                <div className="card--value">
                                                    <ul>
                                                        <li>
                                                            <span>Query</span>
                                                            <span>{this.props.match.params.query}</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <br />
                                                <p>The following formats are supported:</p>
                                                <br />
                                                <ul>
                                                    <li>
                                                        <span>Blocks</span>
                                                        <span>64 Hex characters</span>
                                                    </li>
                                                    <li>
                                                        <span>Block using Transaction Id</span>
                                                        <span>64 Hex characters</span>
                                                    </li>
                                                    <li>
                                                        <span>Addresses</span>
                                                        <span>64 Hex characters or Bech32 Format</span>
                                                    </li>
                                                    <li>
                                                        <span>Nft/Alias Addresses</span>
                                                        <span>66 Hex characters or Bech32 Format</span>
                                                    </li>
                                                    <li>
                                                        <span>Outputs</span>
                                                        <span>68 Hex characters</span>
                                                    </li>
                                                    <li>
                                                        <span>Alias Id</span>
                                                        <span>64 Hex characters</span>
                                                    </li>
                                                    <li>
                                                        <span>Foundry Id</span>
                                                        <span>76 Hex characters</span>
                                                    </li>
                                                    <li>
                                                        <span>Token Id</span>
                                                        <span>76 Hex characters</span>
                                                    </li>
                                                    <li>
                                                        <span>NFT Id</span>
                                                        <span>64 Hex characters</span>
                                                    </li>
                                                    <li>
                                                        <span>Milestone Id</span>
                                                        <span>64 Hex characters</span>
                                                    </li>
                                                    <li>
                                                        <span>Milestone Index</span>
                                                        <span>Numeric</span>
                                                    </li>
                                                </ul>                                                <br />
                                                <p>Please perform another search with a valid hash.</p>
                                            </React.Fragment>
                                        )}
                                    </div>
                                </div>
                            )}
                            {this.state.completion === "invalid" && (
                                <div className="card">
                                    <div className="card--header">
                                        <h2>Incorrect query format</h2>
                                    </div>
                                    <div className="card--content">
                                        {this.state.protocolVersion === STARDUST && (
                                            <p className="danger">
                                                {this.state.invalidError}.
                                            </p>
                                        )}
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
        const query = (this.props.match.params.query ?? "").trim();

        let status = "";
        let statusBusy = false;
        let completion = "";
        const redirect = "";
        let invalidError = "";

        if (query.length > 0) {
            if (this.state.protocolVersion === STARDUST) {
                status = "Detecting query type...";
                statusBusy = true;
                if (this._isMounted) {
                    setImmediate(
                        async () => {
                            if (this._isMounted) {
                                const response = await this._tangleCacheService.search(
                                    this.props.match.params.network,
                                    query
                                );

                                if (response) {
                                    let objType = "";
                                    let objParam = query;
                                    if (response.block) {
                                        objType = "block";
                                    } else if (response.addressDetails?.hex) {
                                        objType = "addr";
                                    } else if (response.output) {
                                        objType = "block";
                                        objParam = response.output.metadata.blockId;
                                    } else if (response.milestone?.blockId) {
                                        objType = "block";
                                        objParam = response.milestone?.blockId;
                                    } else if (response.did) {
                                        objType = "identity-resolver";
                                        objParam = response.did;
                                    }
                                    this.setState({
                                        status: "",
                                        statusBusy: false,
                                        redirect: `/${this.props.match.params.network}/${objType}/${objParam}`
                                    });
                                } else {
                                    this.setState({
                                        completion: "notFound",
                                        status: "",
                                        statusBusy: false
                                    });
                                }
                            }
                        });
                }
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
            invalidError
        });
    }
}

export default Search;
