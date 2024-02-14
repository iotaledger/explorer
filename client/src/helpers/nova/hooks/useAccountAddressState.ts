import { Reducer, useEffect, useReducer } from "react";
import { AccountAddress, AccountOutput } from "@iota/sdk-wasm-nova/web";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { useAccountDetails } from "./useAccountDetails";
import { useLocation, useParams } from "react-router-dom";
import { AddressRouteProps } from "~/app/routes/AddressRouteProps";
import { useNetworkInfoNova } from "../networkInfo";
import { AddressHelper } from "~/helpers/nova/addressHelper";
import { useAddressBalance } from "./useAddressBalance";

export interface IAccountAddressState {
    accountAddressDetails: IAddressDetails | null;
    accountOutput: AccountOutput | null;
    totalBalance: number | null;
    availableBalance: number | null;
    isAccountDetailsLoading: boolean;
    isAssociatedOutputsLoading: boolean;
}

const initialState = {
    accountAddressDetails: null,
    accountOutput: null,
    totalBalance: null,
    availableBalance: null,
    isAccountDetailsLoading: true,
    isAssociatedOutputsLoading: false,
};

/**
 * Route Location Props
 */
interface IAddressPageLocationProps {
    addressDetails: IAddressDetails;
}

export const useAccountAddressState = (address: AccountAddress): [IAccountAddressState, React.Dispatch<Partial<IAccountAddressState>>] => {
    const location = useLocation();
    const { network } = useParams<AddressRouteProps>();
    const { bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [state, setState] = useReducer<Reducer<IAccountAddressState, Partial<IAccountAddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        initialState,
    );

    const { accountOutput, isLoading: isAccountDetailsLoading } = useAccountDetails(network, address.accountId);
    const { totalBalance, availableBalance } = useAddressBalance(network, state.accountAddressDetails, accountOutput);

    useEffect(() => {
        const locationState = location.state as IAddressPageLocationProps;
        const { addressDetails } = locationState?.addressDetails
            ? locationState
            : { addressDetails: AddressHelper.buildAddress(bech32Hrp, address) };

        setState({
            ...initialState,
            accountAddressDetails: addressDetails,
        });
    }, []);

    useEffect(() => {
        setState({
            accountOutput,
            isAccountDetailsLoading,
            totalBalance,
            availableBalance,
        });
    }, [accountOutput, totalBalance, availableBalance, isAccountDetailsLoading]);

    return [state, setState];
};
