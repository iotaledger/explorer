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
import { TransactionsHelper } from "../transactionsHelper";

export interface IAnchorAddressState {
    addressDetails: IAddressDetails | null;
    anchorOutput: AnchorOutput | null;
    availableBalance: number | null;
    totalBalance: number | null;
    storageDeposit: number | null;
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
    totalBalance: null,
    availableBalance: null,
    storageDeposit: null,
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
    const { bech32Hrp, protocolInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const [state, setState] = useReducer<Reducer<IAnchorAddressState, Partial<IAnchorAddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        initialState,
    );

    const { anchorOutput, isLoading: isAnchorDetailsLoading } = useAnchorDetails(network, address.anchorId);
    const { totalBalance, availableBalance } = useAddressBalance(network, state.addressDetails, anchorOutput);
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
        let updatedState: Partial<IAnchorAddressState> = {
            anchorOutput,
            totalBalance,
            availableBalance,
            addressBasicOutputs,
            addressNftOutputs,
            isBasicOutputsLoading,
            isNftOutputsLoading,
            isAnchorDetailsLoading,
        };

        if (anchorOutput) {
            const addressOutputs = [...(addressBasicOutputs ?? []), ...(addressNftOutputs ?? [])].map(({ output }) => output);
            if (protocolInfo?.parameters.storageScoreParameters) {
                const storageDeposit = TransactionsHelper.computeStorageDeposit(
                    [...addressOutputs, anchorOutput],
                    protocolInfo?.parameters.storageScoreParameters,
                );
                updatedState = {
                    ...updatedState,
                    storageDeposit,
                };
            }
        }

        setState(updatedState);
    }, [
        anchorOutput,
        totalBalance,
        availableBalance,
        addressBasicOutputs,
        addressNftOutputs,
        isBasicOutputsLoading,
        isNftOutputsLoading,
        isAnchorDetailsLoading,
    ]);

    return [state, setState];
};
