import { Reducer, useEffect, useReducer } from "react";
import { NftAddress, NftOutput, OutputResponse } from "@iota/sdk-wasm-nova/web";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { useNftDetails } from "./useNftDetails";
import { useLocation, useParams } from "react-router-dom";
import { AddressRouteProps } from "~/app/routes/AddressRouteProps";
import { useNetworkInfoNova } from "../networkInfo";
import { AddressHelper } from "~/helpers/nova/addressHelper";
import { useAddressBalance } from "./useAddressBalance";
import { useAddressBasicOutputs } from "~/helpers/nova/hooks/useAddressBasicOutputs";
import { useAddressNftOutputs } from "~/helpers/nova/hooks/useAddressNftOutputs";
import { IManaBalance } from "~/models/api/nova/address/IAddressBalanceResponse";
import { useOutputManaRewards } from "./useOutputManaRewards";

export interface INftAddressState {
    addressDetails: IAddressDetails | null;
    nftOutput: NftOutput | null;
    totalBaseTokenBalance: number | null;
    availableBaseTokenBalance: number | null;
    totalManaBalance: IManaBalance | null;
    availableManaBalance: IManaBalance | null;
    addressBasicOutputs: OutputResponse[] | null;
    addressNftOutputs: OutputResponse[] | null;
    isBasicOutputsLoading: boolean;
    isNftOutputsLoading: boolean;
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
    addressBasicOutputs: null,
    addressNftOutputs: null,
    isBasicOutputsLoading: false,
    isNftOutputsLoading: false,
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
    const { manaRewards } = useOutputManaRewards(network, nftOutputMetadata?.outputId ?? "");
    const { totalBaseTokenBalance, availableBaseTokenBalance, totalManaBalance, availableManaBalance } = useAddressBalance(
        network,
        state.addressDetails,
        nftOutput,
        nftOutputMetadata,
        manaRewards,
    );
    const [addressBasicOutputs, isBasicOutputsLoading] = useAddressBasicOutputs(network, state.addressDetails?.bech32 ?? null);
    const [addressNftOutputs, isNftOutputsLoading] = useAddressNftOutputs(network, state.addressDetails?.bech32 ?? null);

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
            isNftDetailsLoading,
            addressBasicOutputs,
            addressNftOutputs,
            isBasicOutputsLoading,
            isNftOutputsLoading,
        });
    }, [
        nftOutput,
        totalBaseTokenBalance,
        availableBaseTokenBalance,
        totalManaBalance,
        availableManaBalance,
        isNftDetailsLoading,
        addressBasicOutputs,
        addressNftOutputs,
        isBasicOutputsLoading,
        isNftOutputsLoading,
    ]);

    return [state, setState];
};
