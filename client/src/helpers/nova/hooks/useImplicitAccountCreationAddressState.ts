import { ImplicitAccountCreationAddress, OutputResponse } from "@iota/sdk-wasm-nova/web";
import { Reducer, useEffect, useReducer } from "react";
import { useLocation, useParams } from "react-router-dom";
import { AddressRouteProps } from "~/app/routes/AddressRouteProps";
import { useNetworkInfoNova } from "../networkInfo";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { AddressHelper } from "~/helpers/nova/addressHelper";
import { useAddressBalance } from "./useAddressBalance";
import { useAddressBasicOutputs } from "~/helpers/nova/hooks/useAddressBasicOutputs";
import { useAddressNftOutputs } from "~/helpers/nova/hooks/useAddressNftOutputs";
import { TransactionsHelper } from "../transactionsHelper";

export interface IImplicitAccountCreationAddressState {
    addressDetails: IAddressDetails | null;
    totalBalance: number | null;
    availableBalance: number | null;
    storageDeposit: number | null;
    addressBasicOutputs: OutputResponse[] | null;
    addressNftOutputs: OutputResponse[] | null;
    isBasicOutputsLoading: boolean;
    isNftOutputsLoading: boolean;
    isAssociatedOutputsLoading: boolean;
    isAddressHistoryLoading: boolean;
    isAddressHistoryDisabled: boolean;
}

const initialState = {
    addressDetails: null,
    totalBalance: null,
    availableBalance: null,
    storageDeposit: null,
    addressBasicOutputs: null,
    addressNftOutputs: null,
    isBasicOutputsLoading: false,
    isNftOutputsLoading: false,
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
    const { bech32Hrp, protocolInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const [state, setState] = useReducer<Reducer<IImplicitAccountCreationAddressState, Partial<IImplicitAccountCreationAddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        initialState,
    );

    const { totalBalance, availableBalance } = useAddressBalance(network, state.addressDetails, null);
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
        let updatedState: Partial<IImplicitAccountCreationAddressState> = {
            totalBalance,
            availableBalance,
            addressBasicOutputs,
            addressNftOutputs,
            isBasicOutputsLoading,
            isNftOutputsLoading,
        };

        const addressOutputs = [...(addressBasicOutputs ?? []), ...(addressNftOutputs ?? [])].map(({ output }) => output);
        if (protocolInfo?.parameters.storageScoreParameters) {
            const storageDeposit = TransactionsHelper.computeStorageDeposit(
                [...addressOutputs],
                protocolInfo?.parameters.storageScoreParameters,
            );
            updatedState = {
                ...updatedState,
                storageDeposit,
            };
        }

        setState(updatedState);
    }, [totalBalance, availableBalance, addressBasicOutputs, addressNftOutputs, isBasicOutputsLoading, isBasicOutputsLoading]);

    return [state, setState];
};
