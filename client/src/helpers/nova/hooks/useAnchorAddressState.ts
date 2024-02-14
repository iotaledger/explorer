import { Reducer, useEffect, useReducer } from "react";
import { AnchorAddress, AnchorOutput } from "@iota/sdk-wasm-nova/web";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { useAnchorDetails } from "./useAnchorDetails";
import { useLocation, useParams } from "react-router-dom";
import { AddressRouteProps } from "~/app/routes/AddressRouteProps";
import { useNetworkInfoNova } from "../networkInfo";
import { AddressHelper } from "~/helpers/nova/addressHelper";
import { useAddressBalance } from "./useAddressBalance";

export interface IAnchorAddressState {
    anchorAddressDetails: IAddressDetails | null;
    anchorOutput: AnchorOutput | null;
    availableBalance: number | null;
    totalBalance: number | null;
    isAnchorDetailsLoading: boolean;
    isAssociatedOutputsLoading: boolean;
}

const initialState = {
    anchorAddressDetails: null,
    anchorOutput: null,
    totalBalance: null,
    availableBalance: null,
    isAnchorDetailsLoading: true,
    isAssociatedOutputsLoading: false,
};

/**
 * Route Location Props
 */
interface IAddressPageLocationProps {
    addressDetails: IAddressDetails;
}

export const useAnchorAddressState = (address: AnchorAddress): [IAnchorAddressState, React.Dispatch<Partial<IAnchorAddressState>>] => {
    const location = useLocation();
    const { network } = useParams<AddressRouteProps>();
    const { bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [state, setState] = useReducer<Reducer<IAnchorAddressState, Partial<IAnchorAddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        initialState,
    );

    const { anchorOutput, isLoading: isAnchorDetailsLoading } = useAnchorDetails(network, address.anchorId);
    const { totalBalance, availableBalance } = useAddressBalance(network, state.anchorAddressDetails, anchorOutput);

    useEffect(() => {
        const locationState = location.state as IAddressPageLocationProps;
        const { addressDetails } = locationState?.addressDetails
            ? locationState
            : { addressDetails: AddressHelper.buildAddress(bech32Hrp, address) };

        setState({
            ...initialState,
            anchorAddressDetails: addressDetails,
        });
    }, []);

    useEffect(() => {
        setState({
            anchorOutput,
            totalBalance,
            availableBalance,
            isAnchorDetailsLoading,
        });
    }, [anchorOutput, totalBalance, availableBalance, isAnchorDetailsLoading]);

    return [state, setState];
};
