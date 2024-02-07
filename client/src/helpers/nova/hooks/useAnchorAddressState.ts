import { Reducer, useEffect, useReducer } from "react";
import { AnchorAddress, AnchorOutput } from "@iota/sdk-wasm-nova/web";
import { IBech32AddressDetails } from "~/models/api/IBech32AddressDetails";
import { useAnchorDetails } from "./useAnchorDetails";
import { useLocation, useParams } from "react-router-dom";
import { AddressRouteProps } from "~/app/routes/AddressRouteProps";
import { useNetworkInfoNova } from "../networkInfo";
import { Bech32AddressHelper } from "~/helpers/nova/bech32AddressHelper";

export interface IAnchorAddressState {
    anchorAddressDetails: IBech32AddressDetails | null;
    anchorOutput: AnchorOutput | null;
    isAnchorDetailsLoading: boolean;
}

const initialState = {
    anchorAddressDetails: null,
    anchorOutput: null,
    isAnchorDetailsLoading: true,
};

/**
 * Route Location Props
 */
interface IAddressPageLocationProps {
    addressDetails: IBech32AddressDetails;
}

export const useAnchorAddressState = (address: AnchorAddress): IAnchorAddressState => {
    const location = useLocation();
    const { network } = useParams<AddressRouteProps>();
    const { bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [state, setState] = useReducer<Reducer<IAnchorAddressState, Partial<IAnchorAddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        initialState,
    );

    const { anchorOutput, isLoading: isAnchorDetailsLoading } = useAnchorDetails(network, address.anchorId);

    useEffect(() => {
        const locationState = location.state as IAddressPageLocationProps;
        const { addressDetails } = locationState?.addressDetails
            ? locationState
            : { addressDetails: Bech32AddressHelper.buildAddress(bech32Hrp, address) };

        setState({
            ...initialState,
            anchorAddressDetails: addressDetails,
        });
    }, []);

    useEffect(() => {
        setState({
            anchorOutput,
            isAnchorDetailsLoading,
        });
    }, [anchorOutput, isAnchorDetailsLoading]);

    return {
        anchorAddressDetails: state.anchorAddressDetails,
        anchorOutput: state.anchorOutput,
        isAnchorDetailsLoading: state.isAnchorDetailsLoading,
    };
};
