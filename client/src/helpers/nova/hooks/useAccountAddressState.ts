import { Reducer, useEffect, useReducer } from "react";
import { AccountAddress, AccountOutput, OutputResponse } from "@iota/sdk-wasm-nova/web";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { useAccountDetails } from "./useAccountDetails";
import { useLocation, useParams } from "react-router-dom";
import { AddressRouteProps } from "~/app/routes/AddressRouteProps";
import { useNetworkInfoNova } from "../networkInfo";
import { AddressHelper } from "~/helpers/nova/addressHelper";
import { useAddressBalance } from "./useAddressBalance";
import { useAddressBasicOutputs } from "~/helpers/nova/hooks/useAddressBasicOutputs";
import { useAccountControlledFoundries } from "./useAccountControlledFoundries";

export interface IAccountAddressState {
    addressDetails: IAddressDetails | null;
    accountOutput: AccountOutput | null;
    totalBalance: number | null;
    availableBalance: number | null;
    addressBasicOutputs: OutputResponse[] | null;
    foundries: string[] | null;
    isAccountDetailsLoading: boolean;
    isAssociatedOutputsLoading: boolean;
    isBasicOutputsLoading: boolean;
    isFoundriesLoading: boolean;
}

const initialState = {
    addressDetails: null,
    accountOutput: null,
    totalBalance: null,
    availableBalance: null,
    addressBasicOutputs: null,
    foundries: null,
    isAccountDetailsLoading: true,
    isAssociatedOutputsLoading: false,
    isBasicOutputsLoading: false,
    isFoundriesLoading: false,
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
    const { totalBalance, availableBalance } = useAddressBalance(network, state.addressDetails, accountOutput);
    const [addressBasicOutputs, isBasicOutputsLoading] = useAddressBasicOutputs(network, state.addressDetails?.bech32 ?? null);
    const [foundries, isFoundriesLoading] = useAccountControlledFoundries(network, state.addressDetails);

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
            accountOutput,
            isAccountDetailsLoading,
            totalBalance,
            availableBalance,
            foundries,
            addressBasicOutputs,
            isBasicOutputsLoading,
            isFoundriesLoading,
        });
    }, [accountOutput, totalBalance, availableBalance, addressBasicOutputs, isAccountDetailsLoading, isBasicOutputsLoading]);

    return [state, setState];
};
