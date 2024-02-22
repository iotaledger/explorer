import { Reducer, useEffect, useReducer } from "react";
import {
    AccountAddress,
    AccountOutput,
    BlockIssuerFeature,
    CongestionResponse,
    FeatureType,
    OutputResponse,
} from "@iota/sdk-wasm-nova/web";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { useAccountDetails } from "./useAccountDetails";
import { useLocation, useParams } from "react-router-dom";
import { AddressRouteProps } from "~/app/routes/AddressRouteProps";
import { useNetworkInfoNova } from "../networkInfo";
import { AddressHelper } from "~/helpers/nova/addressHelper";
import { useAddressBalance } from "./useAddressBalance";
import { useAddressBasicOutputs } from "~/helpers/nova/hooks/useAddressBasicOutputs";
import { useAccountControlledFoundries } from "./useAccountControlledFoundries";
import { useAccountCongestion } from "./useAccountCongestion";

export interface IAccountAddressState {
    addressDetails: IAddressDetails | null;
    accountOutput: AccountOutput | null;
    totalBalance: number | null;
    availableBalance: number | null;
    blockIssuerFeature: BlockIssuerFeature | null;
    addressBasicOutputs: OutputResponse[] | null;
    foundries: string[] | null;
    congestion: CongestionResponse | null;
    isAccountDetailsLoading: boolean;
    isAssociatedOutputsLoading: boolean;
    isBasicOutputsLoading: boolean;
    isFoundriesLoading: boolean;
    isCongestionLoading: boolean;
}

const initialState = {
    addressDetails: null,
    accountOutput: null,
    totalBalance: null,
    availableBalance: null,
    blockIssuerFeature: null,
    addressBasicOutputs: null,
    foundries: null,
    congestion: null,
    isAccountDetailsLoading: true,
    isAssociatedOutputsLoading: false,
    isBasicOutputsLoading: false,
    isFoundriesLoading: false,
    isCongestionLoading: false,
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
    const { congestion, isLoading: isCongestionLoading } = useAccountCongestion(network, state.addressDetails?.hex ?? null);

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
        let updatedState: Partial<IAccountAddressState> = {
            accountOutput,
            isAccountDetailsLoading,
            totalBalance,
            availableBalance,
            foundries,
            congestion,
            addressBasicOutputs,
            isBasicOutputsLoading,
            isFoundriesLoading,
            isCongestionLoading,
        };

        if (accountOutput && !state.blockIssuerFeature) {
            const blockIssuerFeature = accountOutput?.features?.find(
                (feature) => feature.type === FeatureType.BlockIssuer,
            ) as BlockIssuerFeature;
            if (blockIssuerFeature) {
                updatedState = {
                    ...updatedState,
                    blockIssuerFeature,
                };
            }
        }

        setState(updatedState);
    }, [
        accountOutput,
        totalBalance,
        availableBalance,
        addressBasicOutputs,
        congestion,
        isAccountDetailsLoading,
        isBasicOutputsLoading,
        isCongestionLoading,
    ]);

    return [state, setState];
};
