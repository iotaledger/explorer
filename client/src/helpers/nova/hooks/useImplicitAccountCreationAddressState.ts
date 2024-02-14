import { ImplicitAccountCreationAddress } from "@iota/sdk-wasm-nova/web";
import { Reducer, useEffect, useReducer } from "react";
import { useLocation, useParams } from "react-router-dom";
import { AddressRouteProps } from "~/app/routes/AddressRouteProps";
import { useNetworkInfoNova } from "../networkInfo";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { AddressHelper } from "~/helpers/nova/addressHelper";
import { useAddressBalance } from "./useAddressBalance";

export interface IImplicitAccountCreationAddressState {
    implicitAccountCreationAddressDetails: IAddressDetails | null;
    totalBalance: number | null;
    availableBalance: number | null;
}

const initialState = {
    implicitAccountCreationAddressDetails: null,
    totalBalance: null,
    availableBalance: null,
};

/**
 * Route Location Props
 */
interface IAddressPageLocationProps {
    addressDetails: IAddressDetails;
}

export const useImplicitAccountCreationAddressState = (address: ImplicitAccountCreationAddress) => {
    const location = useLocation();
    const { network } = useParams<AddressRouteProps>();
    const { bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [state, setState] = useReducer<Reducer<IImplicitAccountCreationAddressState, Partial<IImplicitAccountCreationAddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        initialState,
    );

    const { totalBalance, availableBalance } = useAddressBalance(network, state.implicitAccountCreationAddressDetails, null);

    useEffect(() => {
        const locationState = location.state as IAddressPageLocationProps;
        const { addressDetails } = locationState?.addressDetails
            ? locationState
            : { addressDetails: AddressHelper.buildAddress(bech32Hrp, address) };

        setState({
            ...initialState,
            implicitAccountCreationAddressDetails: addressDetails,
        });
    }, []);

    useEffect(() => {
        setState({
            totalBalance,
            availableBalance,
        });
    }, [totalBalance, availableBalance]);

    return {
        implicitAccountCreationAddressDetails: state.implicitAccountCreationAddressDetails,
        totalBalance: state.totalBalance,
        availableBalance: state.availableBalance,
    };
};
