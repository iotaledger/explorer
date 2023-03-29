import { NFT_ADDRESS_TYPE } from "@iota/iota.js-stardust";
import React, { useContext } from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import NetworkContext from "../../context/NetworkContext";

interface NftRedirectRouteProps {
    /**
     * The network.
     */
    network: string;

    /**
     * The nftId to redirect.
     */
    nftId: string;
}

const ADDRESS_ROUTE = "addr";

const NftRedirectRoute: React.FC<RouteComponentProps<NftRedirectRouteProps>> = (
    { match: { params: { network, nftId } } }
) => {
    const { bech32Hrp } = useContext(NetworkContext);
    const nftAddress = Bech32AddressHelper.buildAddress(bech32Hrp, nftId, NFT_ADDRESS_TYPE);
    const redirectState = {
        addressDetails: nftAddress
    };
    const routeParam = nftAddress.bech32;
    const redirect = `/${network}/${ADDRESS_ROUTE}/${routeParam}`;
    return (
        <Redirect to={{ pathname: redirect, state: redirectState }} />
    );
};

export default NftRedirectRoute;
