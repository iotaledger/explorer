import { Ed25519Address } from "@iota/sdk-wasm-nova/web";
import { Reducer, useEffect, useReducer } from "react";
import { useLocation } from "react-router-dom";
import { useNetworkInfoNova } from "../networkInfo";
import { IBech32AddressDetails } from "~/models/api/IBech32AddressDetails";
import { Bech32AddressHelper } from "~/helpers/nova/bech32AddressHelper";

export interface IEd25519AddressState {
    ed25519AddressDetails: IBech32AddressDetails | null;
}

const initialState = {
    ed25519AddressDetails: null,
};

/**
 * Route Location Props
 */
interface IAddressPageLocationProps {
    addressDetails: IBech32AddressDetails;
}

export const useEd25519AddressState = (address: Ed25519Address) => {
    const location = useLocation();
    const { bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [state, setState] = useReducer<Reducer<IEd25519AddressState, Partial<IEd25519AddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        initialState,
    );

    useEffect(() => {
        const locationState = location.state as IAddressPageLocationProps;
        const { addressDetails } = locationState?.addressDetails
            ? locationState
            : { addressDetails: Bech32AddressHelper.buildAddress(bech32Hrp, address) };

        setState({
            ...initialState,
            ed25519AddressDetails: addressDetails,
        });
    }, []);

    return {
        ed25519AddressDetails: state.ed25519AddressDetails,
    };
};
