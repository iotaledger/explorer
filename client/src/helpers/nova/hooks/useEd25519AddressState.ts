import { Ed25519Address, OutputWithMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { Reducer, useEffect, useReducer } from "react";
import { useLocation } from "react-router-dom";
import { useNetworkInfoNova } from "../networkInfo";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { AddressHelper } from "~/helpers/nova/addressHelper";
import { useAddressBalance } from "./useAddressBalance";
import { useAddressBasicOutputs } from "~/helpers/nova/hooks/useAddressBasicOutputs";
import { useAddressNftOutputs } from "~/helpers/nova/hooks/useAddressNftOutputs";
import { useAddressDelegationOutputs } from "./useAddressDelegationOutputs";
import { IManaBalance } from "~/models/api/nova/address/IAddressBalanceResponse";
import { IDelegationWithDetails } from "~/models/api/nova/IDelegationWithDetails";

export interface IEd25519AddressState {
    addressDetails: IAddressDetails | null;
    totalBaseTokenBalance: number | null;
    availableBaseTokenBalance: number | null;
    totalManaBalance: IManaBalance | null;
    availableManaBalance: IManaBalance | null;
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
    totalManaBalance: null,
    availableManaBalance: null,
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

export const useEd25519AddressState = (address: Ed25519Address): [IEd25519AddressState, React.Dispatch<Partial<IEd25519AddressState>>] => {
    const location = useLocation();
    const { name: network, bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [state, setState] = useReducer<Reducer<IEd25519AddressState, Partial<IEd25519AddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        initialState,
    );

    const { totalBaseTokenBalance, availableBaseTokenBalance, totalManaBalance, availableManaBalance } = useAddressBalance(
        network,
        state.addressDetails,
        null,
    );
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
            addressDetails,
        });
    }, []);

    useEffect(() => {
        setState({
            totalBaseTokenBalance,
            availableBaseTokenBalance,
            totalManaBalance,
            availableManaBalance,
            addressBasicOutputs,
            addressNftOutputs,
            addressDelegationOutputs,
            isBasicOutputsLoading,
            isNftOutputsLoading,
            isDelegationOutputsLoading,
        });
    }, [
        totalManaBalance,
        availableManaBalance,
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
