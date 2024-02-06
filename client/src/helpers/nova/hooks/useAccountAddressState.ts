import { Reducer, useEffect, useReducer } from "react";
import { AccountAddress, AccountOutput } from "@iota/sdk-wasm-nova/web";
import { IBech32AddressDetails } from "~/models/api/IBech32AddressDetails";
import { useAccountDetails } from "./useAccountDetails";
import { useLocation, useParams } from "react-router-dom";
import { AddressRouteProps } from "~/app/routes/AddressRouteProps";
import { useNetworkInfoNova } from "../networkInfo";
import { Bech32AddressHelper } from "~/helpers/nova/bech32AddressHelper";

export interface IAccountAddressState {
    accountAddressDetails: IBech32AddressDetails | null;
    accountOutput: AccountOutput | null;
    isAccountDetailsLoading: boolean;
}

const initialState = {
    accountAddressDetails: null,
    accountOutput: null,
    isAccountDetailsLoading: true,
};

/**
 * Route Location Props
 */
interface IAddressPageLocationProps {
    addressDetails: IBech32AddressDetails;
}

export const useAccountAddressState = (address: AccountAddress): IAccountAddressState => {
    const location = useLocation();
    const { network } = useParams<AddressRouteProps>();
    const { bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [state, setState] = useReducer<Reducer<IAccountAddressState, Partial<IAccountAddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        initialState,
    );

    const { accountOutput, isLoading: isAccountDetailsLoading } = useAccountDetails(network, address.accountId);

    useEffect(() => {
        const locationState = location.state as IAddressPageLocationProps;
        const { addressDetails } = locationState?.addressDetails
            ? locationState
            : { addressDetails: Bech32AddressHelper.buildAddress(bech32Hrp, address) };

        setState({
            ...initialState,
            accountAddressDetails: addressDetails,
        });
    }, []);

    useEffect(() => {
        setState({
            accountOutput,
            isAccountDetailsLoading,
        });
    }, [accountOutput, isAccountDetailsLoading]);

    return {
        accountAddressDetails: state.accountAddressDetails,
        accountOutput: state.accountOutput,
        isAccountDetailsLoading: state.isAccountDetailsLoading,
    };
};
