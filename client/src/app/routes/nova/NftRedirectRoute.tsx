import { AddressType } from "@iota/sdk-wasm-nova/web";
import React from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { AddressHelper } from "~helpers/nova/addressHelper";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";

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

const NftRedirectRoute: React.FC<RouteComponentProps<NftRedirectRouteProps>> = ({
    match: {
        params: { network, nftId },
    },
}) => {
    const { bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const nftAddress = AddressHelper.buildAddress(bech32Hrp, nftId, AddressType.Nft);
    const redirectState = {
        addressDetails: nftAddress,
    };
    const routeParam = nftAddress.bech32;
    const redirect = `/${network}/${ADDRESS_ROUTE}/${routeParam}`;
    return <Redirect to={{ pathname: redirect, state: redirectState }} />;
};

export default NftRedirectRoute;
