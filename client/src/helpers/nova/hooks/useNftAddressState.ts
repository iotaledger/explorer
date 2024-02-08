import { Reducer, useEffect, useReducer } from "react";
import { NftAddress, NftOutput } from "@iota/sdk-wasm-nova/web";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { useNftDetails } from "./useNftDetails";
import { useLocation, useParams } from "react-router-dom";
import { AddressRouteProps } from "~/app/routes/AddressRouteProps";
import { useNetworkInfoNova } from "../networkInfo";
import { AddressHelper } from "~/helpers/nova/addressHelper";

export interface INftAddressState {
    nftAddressDetails: IAddressDetails | null;
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
    addressDetails: IAddressDetails;
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
            : { addressDetails: AddressHelper.buildAddress(bech32Hrp, address) };

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
