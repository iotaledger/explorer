import { ImplicitAccountCreationAddress, OutputResponse } from "@iota/sdk-wasm-nova/web";
import { Reducer, useEffect, useReducer } from "react";
import { useLocation, useParams } from "react-router-dom";
import { AddressRouteProps } from "~/app/routes/AddressRouteProps";
import { useNetworkInfoNova } from "../networkInfo";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { AddressHelper } from "~/helpers/nova/addressHelper";
import { useAddressBalance } from "./useAddressBalance";
import { useAddressBasicOutputs } from "~/helpers/nova/hooks/useAddressBasicOutputs";

export interface IImplicitAccountCreationAddressState {
    addressDetails: IAddressDetails | null;
    totalBalance: number | null;
    availableBalance: number | null;
    addressBasicOutputs: OutputResponse[] | null;
    isBasicOutputsLoading: boolean;
    isAssociatedOutputsLoading: boolean;
}

const initialState = {
    addressDetails: null,
    totalBalance: null,
    availableBalance: null,
    addressBasicOutputs: null,
    isBasicOutputsLoading: false,
    isAssociatedOutputsLoading: false,
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

    const { totalBalance, availableBalance } = useAddressBalance(network, state.addressDetails, null);
    const [addressBasicOutputs, isBasicOutputsLoading] = useAddressBasicOutputs(network, state.addressDetails?.bech32 ?? null);

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
            totalBalance,
            availableBalance,
            addressBasicOutputs,
            isBasicOutputsLoading,
        });
    }, [totalBalance, availableBalance, addressBasicOutputs, isBasicOutputsLoading]);

    return [state, setState];
};
