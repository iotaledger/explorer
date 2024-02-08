import { ImplicitAccountCreationAddress } from "@iota/sdk-wasm-nova/web";
import { Reducer, useEffect, useReducer } from "react";
import { useLocation } from "react-router-dom";
import { useNetworkInfoNova } from "../networkInfo";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { AddressHelper } from "~/helpers/nova/addressHelper";

export interface IImplicitAccountCreationAddressState {
    implicitAccountCreationAddressDetails: IAddressDetails | null;
}

const initialState = {
    implicitAccountCreationAddressDetails: null,
};

/**
 * Route Location Props
 */
interface IAddressPageLocationProps {
    addressDetails: IAddressDetails;
}

export const useImplicitAccountCreationAddressState = (address: ImplicitAccountCreationAddress) => {
    const location = useLocation();
    const { bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [state, setState] = useReducer<Reducer<IImplicitAccountCreationAddressState, Partial<IImplicitAccountCreationAddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        initialState,
    );

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

    return {
        implicitAccountCreationAddressDetails: state.implicitAccountCreationAddressDetails,
    };
};
