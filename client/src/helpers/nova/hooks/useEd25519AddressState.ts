import { Ed25519Address } from "@iota/sdk-wasm-nova/web";
import { Reducer, useEffect, useReducer } from "react";
import { useLocation } from "react-router-dom";
import { useNetworkInfoNova } from "../networkInfo";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { AddressHelper } from "~/helpers/nova/addressHelper";
import { useAddressBalance } from "./useAddressBalance";

export interface IEd25519AddressState {
    ed25519AddressDetails: IAddressDetails | null;
    totalBalance: number | null;
    availableBalance: number | null;
}

const initialState = {
    ed25519AddressDetails: null,
    totalBalance: null,
    availableBalance: null,
};

/**
 * Route Location Props
 */
interface IAddressPageLocationProps {
    addressDetails: IAddressDetails;
}

export const useEd25519AddressState = (address: Ed25519Address) => {
    const location = useLocation();
    const { name: network, bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [state, setState] = useReducer<Reducer<IEd25519AddressState, Partial<IEd25519AddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        initialState,
    );

    const { totalBalance, availableBalance } = useAddressBalance(network, state.ed25519AddressDetails, null);

    useEffect(() => {
        const locationState = location.state as IAddressPageLocationProps;
        const { addressDetails } = locationState?.addressDetails
            ? locationState
            : { addressDetails: AddressHelper.buildAddress(bech32Hrp, address) };

        setState({
            ...initialState,
            ed25519AddressDetails: addressDetails,
        });
    }, []);

    useEffect(() => {
        setState({
            totalBalance,
            availableBalance,
        });
    }, [totalBalance, availableBalance]);

    return {
        ed25519AddressDetails: state.ed25519AddressDetails,
        totalBalance: state.totalBalance,
        availableBalance: state.availableBalance,
    };
};
