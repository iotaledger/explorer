import { Reducer, useEffect, useReducer } from "react";
import { NftAddress, NftOutput, OutputResponse } from "@iota/sdk-wasm-nova/web";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { useNftDetails } from "./useNftDetails";
import { useLocation, useParams } from "react-router-dom";
import { AddressRouteProps } from "~/app/routes/AddressRouteProps";
import { useNetworkInfoNova } from "../networkInfo";
import { AddressHelper } from "~/helpers/nova/addressHelper";
import { useAddressBalance } from "./useAddressBalance";
import { useAddressBasicOutputs } from "~/helpers/nova/hooks/useAddressBasicOutputs";
import { useAddressNftOutputs } from "~/helpers/nova/hooks/useAddressNftOutputs";

export interface INftAddressState {
    addressDetails: IAddressDetails | null;
    nftOutput: NftOutput | null;
    totalBalance: number | null;
    availableBalance: number | null;
    addressBasicOutputs: OutputResponse[] | null;
    addressNftOutputs: OutputResponse[] | null;
    isBasicOutputsLoading: boolean;
    isNftOutputsLoading: boolean;
    isNftDetailsLoading: boolean;
    isAssociatedOutputsLoading: boolean;
}

const initialState = {
    addressDetails: null,
    nftOutput: null,
    isNftDetailsLoading: true,
    totalBalance: null,
    availableBalance: null,
    addressBasicOutputs: null,
    addressNftOutputs: null,
    isBasicOutputsLoading: false,
    isNftOutputsLoading: false,
    isAssociatedOutputsLoading: false,
};

/**
 * Route Location Props
 */
interface IAddressPageLocationProps {
    addressDetails: IAddressDetails;
}

export const useNftAddressState = (address: NftAddress): [INftAddressState, React.Dispatch<Partial<INftAddressState>>] => {
    const location = useLocation();
    const { network } = useParams<AddressRouteProps>();
    const { bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [state, setState] = useReducer<Reducer<INftAddressState, Partial<INftAddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        initialState,
    );

    const { nftOutput, isLoading: isNftDetailsLoading } = useNftDetails(network, address.nftId);
    const { totalBalance, availableBalance } = useAddressBalance(network, state.addressDetails, nftOutput);
    const [addressBasicOutputs, isBasicOutputsLoading] = useAddressBasicOutputs(network, state.addressDetails?.bech32 ?? null);
    const [addressNftOutputs, isNftOutputsLoading] = useAddressNftOutputs(network, state.addressDetails?.bech32 ?? null);

    useEffect(() => {
        const locationState = location.state as IAddressPageLocationProps;
        const { addressDetails } = locationState?.addressDetails
            ? locationState
            : { addressDetails: AddressHelper.buildAddress(bech32Hrp, address) };

        setState({
            ...initialState,
            addressDetails,
        });
    }, []);

    useEffect(() => {
        setState({
            nftOutput,
            totalBalance,
            availableBalance,
            isNftDetailsLoading,
            addressBasicOutputs,
            addressNftOutputs,
            isBasicOutputsLoading,
            isNftOutputsLoading,
        });
    }, [
        nftOutput,
        totalBalance,
        availableBalance,
        isNftDetailsLoading,
        addressBasicOutputs,
        addressNftOutputs,
        isBasicOutputsLoading,
        isNftOutputsLoading,
    ]);

    return [state, setState];
};
