import { Reducer, useEffect, useReducer } from "react";
import { NftAddress, NftOutput, OutputWithMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { useNftDetails } from "./useNftDetails";
import { useLocation, useParams } from "react-router-dom";
import { AddressRouteProps } from "~/app/routes/AddressRouteProps";
import { useNetworkInfoNova } from "../networkInfo";
import { AddressHelper } from "~/helpers/nova/addressHelper";
import { useAddressBalance } from "./useAddressBalance";
import { useAddressBasicOutputs } from "~/helpers/nova/hooks/useAddressBasicOutputs";
import { useAddressNftOutputs } from "~/helpers/nova/hooks/useAddressNftOutputs";
import { useAddressDelegationOutputs } from "./useAddressDelegationOutputs";
import { IManaBalance } from "~/models/api/nova/address/IAddressBalanceResponse";
import { IDelegationWithDetails } from "~/models/api/nova/IDelegationWithDetails";

export interface INftAddressState {
    addressDetails: IAddressDetails | null;
    nftOutput: NftOutput | null;
    totalBaseTokenBalance: number | null;
    availableBaseTokenBalance: number | null;
    totalManaBalance: IManaBalance | null;
    availableManaBalance: IManaBalance | null;
    manaRewards: bigint | null;
    addressBasicOutputs: OutputWithMetadataResponse[] | null;
    addressNftOutputs: OutputWithMetadataResponse[] | null;
    addressDelegationOutputs: IDelegationWithDetails[] | null;
    isBasicOutputsLoading: boolean;
    isNftOutputsLoading: boolean;
    isDelegationOutputsLoading: boolean;
    isNftDetailsLoading: boolean;
    isAssociatedOutputsLoading: boolean;
    isAddressHistoryLoading: boolean;
    isAddressHistoryDisabled: boolean;
}

const initialState = {
    addressDetails: null,
    nftOutput: null,
    isNftDetailsLoading: true,
    totalBaseTokenBalance: null,
    availableBaseTokenBalance: null,
    totalManaBalance: null,
    availableManaBalance: null,
    manaRewards: null,
    addressBasicOutputs: null,
    addressNftOutputs: null,
    addressDelegationOutputs: null,
    isBasicOutputsLoading: false,
    isNftOutputsLoading: false,
    isDelegationOutputsLoading: false,
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

export const useNftAddressState = (address: NftAddress): [INftAddressState, React.Dispatch<Partial<INftAddressState>>] => {
    const location = useLocation();
    const { network } = useParams<AddressRouteProps>();
    const { bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [state, setState] = useReducer<Reducer<INftAddressState, Partial<INftAddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        initialState,
    );

    const { nftOutput, nftOutputMetadata, isLoading: isNftDetailsLoading } = useNftDetails(network, address.nftId);
    const [addressBasicOutputs, isBasicOutputsLoading] = useAddressBasicOutputs(network, state.addressDetails?.bech32 ?? null);
    const [addressNftOutputs, isNftOutputsLoading] = useAddressNftOutputs(network, state.addressDetails?.bech32 ?? null);
    const [addressDelegationOutputs, isDelegationOutputsLoading] = useAddressDelegationOutputs(
        network,
        state.addressDetails?.bech32 ?? null,
    );

    const delegationRewards = addressDelegationOutputs?.map((output) => output.rewards?.manaRewards) ?? [];
    const manaRewards =
        delegationRewards.length > 0
            ? delegationRewards.reduce((total, rewardsResponse) => total + BigInt(rewardsResponse?.rewards ?? 0), BigInt(0))
            : null;

    const { totalBaseTokenBalance, availableBaseTokenBalance, totalManaBalance, availableManaBalance } = useAddressBalance(
        network,
        state.addressDetails,
        nftOutput,
        nftOutputMetadata,
        manaRewards,
    );

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
            nftOutput,
            totalBaseTokenBalance,
            availableBaseTokenBalance,
            totalManaBalance,
            availableManaBalance,
            manaRewards,
            isNftDetailsLoading,
            addressBasicOutputs,
            addressNftOutputs,
            addressDelegationOutputs,
            isBasicOutputsLoading,
            isNftOutputsLoading,
            isDelegationOutputsLoading,
        });
    }, [
        nftOutput,
        totalBaseTokenBalance,
        availableBaseTokenBalance,
        totalManaBalance,
        availableManaBalance,
        manaRewards,
        isNftDetailsLoading,
        addressBasicOutputs,
        addressNftOutputs,
        addressDelegationOutputs,
        isBasicOutputsLoading,
        isNftOutputsLoading,
        isDelegationOutputsLoading,
    ]);

    return [state, setState];
};
