import { ImplicitAccountCreationAddress, OutputWithMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { Reducer, useEffect, useReducer } from "react";
import { useLocation, useParams } from "react-router-dom";
import { AddressRouteProps } from "~/app/routes/AddressRouteProps";
import { useNetworkInfoNova } from "../networkInfo";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { AddressHelper } from "~/helpers/nova/addressHelper";
import { useAddressBalance } from "./useAddressBalance";
import { useAddressBasicOutputs } from "~/helpers/nova/hooks/useAddressBasicOutputs";
import { useAddressNftOutputs } from "~/helpers/nova/hooks/useAddressNftOutputs";
import { useAddressDelegationOutputs } from "./useAddressDelegationOutputs";
import { IDelegationWithDetails } from "~/models/api/nova/IDelegationWithDetails";

export interface IImplicitAccountCreationAddressState {
    addressDetails: IAddressDetails | null;
    totalBaseTokenBalance: number | null;
    availableBaseTokenBalance: number | null;
    addressBasicOutputs: OutputWithMetadataResponse[] | null;
    addressNftOutputs: OutputWithMetadataResponse[] | null;
    addressDelegationOutputs: IDelegationWithDetails[] | null;
    isBasicOutputsLoading: boolean;
    isNftOutputsLoading: boolean;
    isDelegationOutputsLoading: boolean;
    isAssociatedOutputsLoading: boolean;
    isAddressHistoryLoading: boolean;
    isAddressHistoryDisabled: boolean;
}

const initialState = {
    addressDetails: null,
    totalBaseTokenBalance: null,
    availableBaseTokenBalance: null,
    addressBasicOutputs: null,
    addressNftOutputs: null,
    addressDelegationOutputs: null,
    isBasicOutputsLoading: false,
    isNftOutputsLoading: false,
    isDelegationOutputsLoading: false,
    isAssociatedOutputsLoading: false,
    isAddressHistoryLoading: true,
    isAddressHistoryDisabled: false,
};

/**
 * Route Location Props
 */
interface IAddressPageLocationProps {
    addressDetails: IAddressDetails;
}

export const useImplicitAccountCreationAddressState = (
    address: ImplicitAccountCreationAddress,
): [IImplicitAccountCreationAddressState, React.Dispatch<Partial<IImplicitAccountCreationAddressState>>] => {
    const location = useLocation();
    const { network } = useParams<AddressRouteProps>();
    const { bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [state, setState] = useReducer<Reducer<IImplicitAccountCreationAddressState, Partial<IImplicitAccountCreationAddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        initialState,
    );

    const { totalBaseTokenBalance, availableBaseTokenBalance } = useAddressBalance(network, state.addressDetails, null);
    const [addressBasicOutputs, isBasicOutputsLoading] = useAddressBasicOutputs(network, state.addressDetails?.bech32 ?? null);
    const [addressNftOutputs, isNftOutputsLoading] = useAddressNftOutputs(network, state.addressDetails?.bech32 ?? null);
    const [addressDelegationOutputs, isDelegationOutputsLoading] = useAddressDelegationOutputs(
        network,
        state.addressDetails?.bech32 ?? null,
    );

    useEffect(() => {
        const locationState = location.state as IAddressPageLocationProps;
        const { addressDetails } = locationState?.addressDetails
            ? locationState
            : { addressDetails: AddressHelper.buildAddress(bech32Hrp, address) };

        setState({
            ...initialState,
            addressDetails,
        });
    }, [address.address().pubKeyHash]);

    useEffect(() => {
        setState({
            totalBaseTokenBalance,
            availableBaseTokenBalance,
            addressBasicOutputs,
            addressNftOutputs,
            addressDelegationOutputs,
            isBasicOutputsLoading,
            isNftOutputsLoading,
            isDelegationOutputsLoading,
        });
    }, [
        totalBaseTokenBalance,
        availableBaseTokenBalance,
        addressBasicOutputs,
        addressNftOutputs,
        addressDelegationOutputs,
        isBasicOutputsLoading,
        isNftOutputsLoading,
        isDelegationOutputsLoading,
    ]);

    return [state, setState];
};
