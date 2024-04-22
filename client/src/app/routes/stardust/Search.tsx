import { AddressType, Utils } from "@iota/sdk-wasm-stardust/web";
import React, { ReactNode } from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "~factories/serviceFactory";
import { scrollToTop } from "~helpers/pageUtils";
import { Bech32AddressHelper } from "~helpers/stardust/bech32AddressHelper";
import { ProtocolVersion, STARDUST } from "~models/config/protocolVersion";
import { NetworkService } from "~services/networkService";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import AsyncComponent from "../../components/AsyncComponent";
import Spinner from "../../components/Spinner";
import NetworkContext from "../../context/NetworkContext";
import { SearchRouteProps } from "../SearchRouteProps";
import { SearchState } from "../SearchState";
import "../Search.scss";

/**
 * Component which will show the search page.
 */
class Search extends AsyncComponent<RouteComponentProps<SearchRouteProps>, SearchState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * The component context.
     */
    public declare context: React.ContextType<typeof NetworkContext>;

    /**
     * API Client for tangle requests.
     */
    private readonly _apiClient: StardustApiClient;

    /**
     * Create a new instance of Search.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<SearchRouteProps>) {
        super(props);

        const networkService = ServiceFactory.get<NetworkService>("network");
        const protocolVersion: ProtocolVersion =
            (props.match.params.network && networkService.get(props.match.params.network)?.protocolVersion) || STARDUST;

        this._apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

        this.state = {
            protocolVersion,
            statusBusy: true,
            status: "",
            completion: "",
            redirect: "",
            search: "",
            invalidError: "",
        };
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        super.componentDidMount();
        scrollToTop();

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
            <Redirect
                to={{
                    pathname: this.state.redirect,
                    search: this.state.search,
                    state: this.state.redirectState,
                }}
            />
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
                                    <p>We could not find any blocks, addresses, outputs, milestones or indexes for the query.</p>
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
                                            <span>Bech32 Format</span>
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
                                    </ul>
                                    <br />
                                    <p>Please perform another search with a valid hash.</p>
                                </div>
                            </div>
                        )}
                        {this.state.completion === "invalid" && (
                            <div className="card">
                                <div className="card--header">
                                    <h2>Incorrect query format</h2>
                                </div>
                                <div className="card--content">
                                    {this.state.protocolVersion === STARDUST && <p className="danger">{this.state.invalidError}.</p>}
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
        const redirect = "";
        let invalidError = "";

        if (query.length > 0) {
            status = "Detecting query type...";
            statusBusy = true;
            if (this._isMounted) {
                setTimeout(async () => {
                    if (this._isMounted) {
                        const response = await this._apiClient.search({
                            network: this.props.match.params.network,
                            query,
                        });

                        if (response && Object.keys(response).length > 0) {
                            const routeSearch = new Map<string, string>();
                            let route = "";
                            let routeParam = query;
                            let redirectState = {};
                            if (response.block) {
                                route = "block";
                            } else if (response.addressDetails?.hex) {
                                route = "addr";
                                redirectState = {
                                    addressDetails: response.addressDetails,
                                };
                            } else if (response.output) {
                                route = "output";
                                const outputId = Utils.computeOutputId(
                                    response.output.metadata.transactionId,
                                    response.output.metadata.outputIndex,
                                );
                                routeParam = outputId;
                            } else if (response.taggedOutputs) {
                                route = "outputs";
                                redirectState = {
                                    outputIds: response.taggedOutputs,
                                    tag: query,
                                };
                                routeParam = "";
                            } else if (response.transactionBlock) {
                                route = "transaction";
                            } else if (response.aliasId) {
                                route = "addr";
                                const aliasAddress = this.buildAddressFromIdAndType(response.aliasId, AddressType.Alias);
                                redirectState = {
                                    addressDetails: aliasAddress,
                                };
                                routeParam = aliasAddress.bech32;
                                if (response.did) {
                                    routeSearch.set("tab", "DID");
                                }
                            } else if (response.foundryId) {
                                route = "foundry";
                                routeParam = response.foundryId;
                            } else if (response.nftId) {
                                route = "addr";
                                const nftAddress = this.buildAddressFromIdAndType(response.nftId, AddressType.Nft);
                                redirectState = {
                                    addressDetails: nftAddress,
                                };
                                routeParam = nftAddress.bech32;
                            } else if (response.milestone?.blockId) {
                                route = "block";
                                routeParam = response.milestone?.blockId;
                            }

                            const getEncodedSearch = () => {
                                if (routeSearch.size === 0) {
                                    return "";
                                }

                                const searchParams = new URLSearchParams();
                                for (const [key, value] of routeSearch.entries()) {
                                    searchParams.append(key, value);
                                }

                                return `?${searchParams.toString()}`;
                            };

                            this.setState({
                                status: "",
                                statusBusy: false,
                                redirect: `/${this.props.match.params.network}/${route}/${routeParam}`,
                                search: getEncodedSearch(),
                                redirectState,
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

    private buildAddressFromIdAndType(id: string, type: number) {
        return Bech32AddressHelper.buildAddress(this.context.bech32Hrp, id, type);
    }
}

export default Search;
