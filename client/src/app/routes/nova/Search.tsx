import React, { useState, useEffect, useContext } from "react";
import { Redirect, RouteComponentProps, useLocation, useParams } from "react-router-dom";
import { SearchRouteProps } from "../SearchRouteProps";
import { NetworkService } from "~/services/networkService";
import { ServiceFactory } from "~/factories/serviceFactory";
import { NOVA, ProtocolVersion } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { SearchState } from "../SearchState";
import NetworkContext from "~/app/context/NetworkContext";
import { Bech32AddressHelper } from "~/helpers/stardust/bech32AddressHelper";
import { scrollToTop } from "~/helpers/pageUtils";
import { AddressType } from "@iota/sdk-wasm-nova/web";
import Spinner from "~/app/components/Spinner";

const Search: React.FC<RouteComponentProps<SearchRouteProps>> = (props) => {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const protocolVersion: ProtocolVersion =
        (props.match.params.network && networkService.get(props.match.params.network)?.protocolVersion) || NOVA;

    const _apiClient = ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`);

    const [state, setState] = useState<SearchState>({
        protocolVersion,
        statusBusy: true,
        status: "",
        completion: "",
        redirect: "",
        search: "",
        invalidError: "",
    });

    const context = useContext(NetworkContext);
    const location = useLocation();
    const params = useParams<SearchRouteProps>();

    useEffect(() => {
        scrollToTop();
        updateState();
    }, [location.pathname]);

    const updateState = () => {
        const query = (params.query ?? "").trim();

        let status = "";
        let statusBusy = false;
        let completion = "";
        const redirect = "";
        let invalidError = "";

        if (query.length > 0) {
            status = "Detecting query type...";
            statusBusy = true;

            setTimeout(async () => {
                const response = await _apiClient.search({
                    network: params.network,
                    query,
                });

                if (response && Object.keys(response).length > 0) {
                    const routeSearch = new Map<string, string>();
                    let route = "";
                    let routeParam = query;
                    let redirectState = {};
                    if (response.block) {
                        route = "block";
                    }
                    // else if (response.addressDetails?.hex) {
                    //     route = "addr";
                    //     redirectState = {
                    //         addressDetails: response.addressDetails,
                    //     };
                    // }
                    // else if (response.output) {
                    //     route = "output";
                    //     const outputId = Utils.computeOutputId(
                    //         response.output.metadata.transactionId,
                    //         response.output.metadata.outputIndex,
                    //     );
                    //     routeParam = outputId;
                    // }
                    // else if (response.taggedOutputs) {
                    //     route = "outputs";
                    //     redirectState = {
                    //         outputIds: response.taggedOutputs,
                    //         tag: query,
                    //     };
                    //     routeParam = "";
                    // }
                    // else if (response.transactionBlock) {
                    //     route = "transaction";
                    // }
                    else if (response.accountId) {
                        route = "addr";
                        const accountAddress = buildAddressFromIdAndType(response.accountId, AddressType.Account);
                        redirectState = {
                            addressDetails: accountAddress,
                        };
                        routeParam = accountAddress.bech32;
                        // if (response.did) {
                        //     routeSearch.set("tab", "DID");
                        // }
                    } else if (response.foundryId) {
                        route = "foundry";
                        routeParam = response.foundryId;
                    } else if (response.nftId) {
                        route = "addr";
                        const nftAddress = buildAddressFromIdAndType(response.nftId, AddressType.Nft);
                        redirectState = {
                            addressDetails: nftAddress,
                        };
                        routeParam = nftAddress.bech32;
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

                    setState((prevState) => ({
                        ...prevState,
                        status: "",
                        statusBusy: false,
                        redirect: `/${params.network}/${route}/${routeParam}`,
                        search: getEncodedSearch(),
                        redirectState,
                    }));
                } else {
                    setState((prevState) => ({
                        ...prevState,
                        completion: "notFound",
                        status: "",
                        statusBusy: false,
                    }));
                }
            }, 0);
        } else {
            invalidError = "the query is empty";
            completion = "invalid";
        }

        setState((prevState) => ({
            ...prevState,
            statusBusy,
            status,
            completion,
            redirect,
            invalidError,
        }));
    };

    const buildAddressFromIdAndType = (id: string, type: number) => {
        return Bech32AddressHelper.buildAddress(context.bech32Hrp, id, type);
    };

    return state.redirect ? (
        <Redirect
            to={{
                pathname: state.redirect,
                search: state.search,
                state: state.redirectState,
            }}
        />
    ) : (
        <div className="search">
            <div className="wrapper">
                <div className="inner">
                    <h1 className="margin-b-s">Search</h1>
                    {!state.completion && state.status && (
                        <div className="card">
                            <div className="card--header">
                                <h2>Searching</h2>
                            </div>
                            <div className="card--content middle row">
                                {state.statusBusy && <Spinner />}
                                <p className="status">{state.status}</p>
                            </div>
                        </div>
                    )}
                    {state.completion === "notFound" && (
                        <div className="card">
                            <div className="card--header">
                                <h2>Not found</h2>
                            </div>
                            <div className="card--content">
                                <p>We could not find any blocks, addresses or outputs for the query.</p>
                                <br />
                                <div className="card--value">
                                    <ul>
                                        <li>
                                            <span>Query</span>
                                            <span>{params.query}</span>
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
                                        <span>Nft/Account Addresses</span>
                                        <span>66 Hex characters or Bech32 Format</span>
                                    </li>
                                    <li>
                                        <span>Outputs</span>
                                        <span>68 Hex characters</span>
                                    </li>
                                    <li>
                                        <span>Account Id</span>
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
                                </ul>
                                <br />
                                <p>Please perform another search with a valid hash.</p>
                            </div>
                        </div>
                    )}
                    {state.completion === "invalid" && (
                        <div className="card">
                            <div className="card--header">
                                <h2>Incorrect query format</h2>
                            </div>
                            <div className="card--content">
                                {state.protocolVersion === NOVA && <p className="danger">{state.invalidError}.</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Search;
