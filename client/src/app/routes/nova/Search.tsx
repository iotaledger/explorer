import React, { useState, useEffect } from "react";
import { Redirect, RouteComponentProps, useLocation, useParams } from "react-router-dom";
import { SearchRouteProps } from "../SearchRouteProps";
import { NetworkService } from "~/services/networkService";
import { ServiceFactory } from "~/factories/serviceFactory";
import { NOVA, ProtocolVersion } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { SearchState } from "../SearchState";
import { scrollToTop } from "~/helpers/pageUtils";
import { AddressType, Block } from "@iota/sdk-wasm-nova/web";
import Spinner from "~/app/components/Spinner";
import { AddressHelper } from "~/helpers/nova/addressHelper";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";

const Search: React.FC<RouteComponentProps<SearchRouteProps>> = (props) => {
    const { protocolInfo, bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
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

    const location = useLocation();
    const { network, query } = useParams<SearchRouteProps>();

    useEffect(() => {
        scrollToTop();
        updateState();
    }, [location.pathname]);

    const updateState = () => {
        const queryTerm = (query ?? "").trim();

        let status = "";
        let statusBusy = false;
        let completion = "";
        const redirect = "";
        let invalidError = "";

        if (queryTerm.length > 0) {
            status = "Detecting query type...";
            statusBusy = true;

            setTimeout(async () => {
                const response = await _apiClient.search({
                    network,
                    query: queryTerm,
                });
                if (!response || response?.error || response?.message) {
                    setState((prevState) => ({
                        ...prevState,
                        completion: response?.error ? "invalid" : "notFound",
                        invalidError: response?.error ?? response?.message ?? "",
                        status: "",
                        statusBusy: false,
                    }));
                } else if (Object.keys(response).length > 0) {
                    const routeSearch = new Map<string, string>();
                    let route = "";
                    let routeParam = query;
                    let redirectState = {};

                    if (response.block) {
                        route = "block";
                        if (protocolInfo) {
                            routeParam = Block.id(response.block, protocolInfo.parameters);
                        }
                    } else if (response.addressDetails) {
                        route = "addr";
                        routeParam = response.addressDetails.bech32;
                        redirectState = {
                            addressDetails: response.addressDetails,
                        };
                    } else if (response.accountId) {
                        route = "addr";
                        const accountAddress = buildAddressFromIdAndType(response.accountId, AddressType.Account);
                        redirectState = {
                            addressDetails: accountAddress,
                        };
                        routeParam = accountAddress.bech32;
                    } else if (response.nftId) {
                        route = "addr";
                        const nftAddress = buildAddressFromIdAndType(response.nftId, AddressType.Nft);
                        redirectState = {
                            addressDetails: nftAddress,
                        };
                        routeParam = nftAddress.bech32;
                    } else if (response.anchorId) {
                        route = "addr";
                        const anchorAddress = buildAddressFromIdAndType(response.anchorId, AddressType.Anchor);
                        redirectState = {
                            addressDetails: anchorAddress,
                        };
                        routeParam = anchorAddress.bech32;
                    } else if (response.output) {
                        route = "output";
                        routeParam = response.output.metadata.outputId;
                    } else if (response.transactionBlock) {
                        route = "transaction";
                    } else if (response.foundryId) {
                        route = "foundry";
                        routeParam = response.foundryId;
                    } else if (response.slotIndex) {
                        route = "slot";
                        routeParam = response.slotIndex.toString();
                    } else if (response.taggedOutputs) {
                        route = "outputs";
                        redirectState = {
                            outputIds: response.taggedOutputs,
                            tag: query,
                        };
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
                        redirect: `/${network}/${route}/${routeParam}`,
                        search: getEncodedSearch(),
                        redirectState,
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
        return AddressHelper.buildAddress(bech32Hrp, id, type);
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
                                            <span>{props.match.params.query}</span>
                                        </li>
                                    </ul>
                                </div>
                                <br />
                                <p>The following formats are supported:</p>
                                <br />
                                <ul>
                                    <li>
                                        <span>Blocks</span>
                                        <span>74 Hex characters</span>
                                    </li>
                                    <li>
                                        <span>Block using Transaction Id</span>
                                        <span>74 Hex characters</span>
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
                                        <span>78 Hex characters</span>
                                    </li>
                                    <li>
                                        <span>Account Id</span>
                                        <span>66 Hex characters</span>
                                    </li>
                                    <li>
                                        <span>Foundry Id</span>
                                        <span>78 Hex characters</span>
                                    </li>
                                    <li>
                                        <span>Token Id</span>
                                        <span>78 Hex characters</span>
                                    </li>
                                    <li>
                                        <span>NFT Id</span>
                                        <span>66 Hex characters</span>
                                    </li>
                                    <li>
                                        <span>Slot</span>
                                        <span>Index or commitmentId of finalized slot</span>
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
