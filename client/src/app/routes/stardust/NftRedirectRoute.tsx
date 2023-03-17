import { NFT_ADDRESS_TYPE } from "@iota/iota.js-stardust";
import React, { useContext } from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import NetworkContext from "../../context/NetworkContext";
import { AddressRouteProps } from "../AddressRouteProps";

const ADDRESS_ROUTE = "addr";

const NftRedirectRoute: React.FC<RouteComponentProps<AddressRouteProps>> = (
    { match: { params: { network, address } } }
) => {
    const { bech32Hrp } = useContext(NetworkContext);
    const nftAddress = Bech32AddressHelper.buildAddress(bech32Hrp, address, NFT_ADDRESS_TYPE);
    const redirectState = {
        addressDetails: nftAddress
    };
    const routeParam = nftAddress.bech32;
    const redirect = `/${network}/${ADDRESS_ROUTE}/${routeParam}`;
    return (
        <Redirect to={{
            pathname: redirect,
            state: redirectState
        }}
        />
    );
};

export default NftRedirectRoute;
