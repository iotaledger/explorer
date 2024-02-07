import { Reducer, useEffect, useReducer } from "react";
import { NftAddress, NftOutput } from "@iota/sdk-wasm-nova/web";
import { IBech32AddressDetails } from "~/models/api/IBech32AddressDetails";
import { useNftDetails } from "./useNftDetails";
import { useLocation, useParams } from "react-router-dom";
import { AddressRouteProps } from "~/app/routes/AddressRouteProps";
import { useNetworkInfoNova } from "../networkInfo";
import { Bech32AddressHelper } from "~/helpers/nova/bech32AddressHelper";

export interface INftAddressState {
    nftAddressDetails: IBech32AddressDetails | null;
    nftOutput: NftOutput | null;
    isNftDetailsLoading: boolean;
}

const initialState = {
    nftAddressDetails: null,
    nftOutput: null,
    isNftDetailsLoading: true,
};

/**
 * Route Location Props
 */
interface IAddressPageLocationProps {
    addressDetails: IBech32AddressDetails;
}

export const useNftAddressState = (address: NftAddress): INftAddressState => {
    const location = useLocation();
    const { network } = useParams<AddressRouteProps>();
    const { bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [state, setState] = useReducer<Reducer<INftAddressState, Partial<INftAddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        initialState,
    );

    const { nftOutput, isLoading: isNftDetailsLoading } = useNftDetails(network, address.nftId);

    useEffect(() => {
        const locationState = location.state as IAddressPageLocationProps;
        const { addressDetails } = locationState?.addressDetails
            ? locationState
            : { addressDetails: Bech32AddressHelper.buildAddress(bech32Hrp, address) };

        setState({
            ...initialState,
            nftAddressDetails: addressDetails,
        });
    }, []);

    useEffect(() => {
        setState({
            nftOutput,
            isNftDetailsLoading,
        });
    }, [nftOutput, isNftDetailsLoading]);

    return {
        nftAddressDetails: state.nftAddressDetails,
        nftOutput: state.nftOutput,
        isNftDetailsLoading: state.isNftDetailsLoading,
    };
};
