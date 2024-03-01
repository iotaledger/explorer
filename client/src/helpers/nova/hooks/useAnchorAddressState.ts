import { Reducer, useEffect, useReducer } from "react";
import { AnchorAddress, AnchorOutput, OutputResponse } from "@iota/sdk-wasm-nova/web";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { useAnchorDetails } from "./useAnchorDetails";
import { useLocation, useParams } from "react-router-dom";
import { AddressRouteProps } from "~/app/routes/AddressRouteProps";
import { useNetworkInfoNova } from "../networkInfo";
import { AddressHelper } from "~/helpers/nova/addressHelper";
import { useAddressBalance } from "./useAddressBalance";
import { useAddressBasicOutputs } from "~/helpers/nova/hooks/useAddressBasicOutputs";
import { useAddressNftOutputs } from "~/helpers/nova/hooks/useAddressNftOutputs";
import { IManaBalance } from "~/models/api/nova/address/IAddressBalanceResponse";
import { useOutputManaRewards } from "./useOutputManaRewards";

export interface IAnchorAddressState {
    addressDetails: IAddressDetails | null;
    anchorOutput: AnchorOutput | null;
    totalBaseTokenBalance: number | null;
    availableBaseTokenBalance: number | null;
    totalManaBalance: IManaBalance | null;
    availableManaBalance: IManaBalance | null;
    addressBasicOutputs: OutputResponse[] | null;
    addressNftOutputs: OutputResponse[] | null;
    isBasicOutputsLoading: boolean;
    isNftOutputsLoading: boolean;
    isAnchorDetailsLoading: boolean;
    isAssociatedOutputsLoading: boolean;
    isAddressHistoryLoading: boolean;
    isAddressHistoryDisabled: boolean;
}

const initialState = {
    addressDetails: null,
    anchorOutput: null,
    totalBaseTokenBalance: null,
    availableBaseTokenBalance: null,
    totalManaBalance: null,
    availableManaBalance: null,
    addressBasicOutputs: null,
    addressNftOutputs: null,
    isBasicOutputsLoading: false,
    isNftOutputsLoading: false,
    isAnchorDetailsLoading: true,
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

export const useAnchorAddressState = (address: AnchorAddress): [IAnchorAddressState, React.Dispatch<Partial<IAnchorAddressState>>] => {
    const location = useLocation();
    const { network } = useParams<AddressRouteProps>();
    const { bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [state, setState] = useReducer<Reducer<IAnchorAddressState, Partial<IAnchorAddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        initialState,
    );

    const { anchorOutput, anchorOutputMetadata, isLoading: isAnchorDetailsLoading } = useAnchorDetails(network, address.anchorId);
    const { manaRewards } = useOutputManaRewards(network, anchorOutputMetadata?.outputId ?? "");
    const { totalBaseTokenBalance, availableBaseTokenBalance, totalManaBalance, availableManaBalance } = useAddressBalance(
        network,
        state.addressDetails,
        anchorOutput,
        anchorOutputMetadata,
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
            anchorOutput,
            totalBaseTokenBalance,
            availableBaseTokenBalance,
            totalManaBalance,
            availableManaBalance,
            addressBasicOutputs,
            addressNftOutputs,
            isBasicOutputsLoading,
            isNftOutputsLoading,
            isAnchorDetailsLoading,
        });
    }, [
        anchorOutput,
        totalBaseTokenBalance,
        availableBaseTokenBalance,
        totalManaBalance,
        availableManaBalance,
        addressBasicOutputs,
        addressNftOutputs,
        isBasicOutputsLoading,
        isNftOutputsLoading,
        isAnchorDetailsLoading,
    ]);

    return [state, setState];
};
