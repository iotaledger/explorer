import { Bech32Helper, HexEncodedString, IAliasOutput, IOutputResponse, OutputTypes } from "@iota/iota.js-stardust";
import { Reducer, useContext, useEffect, useReducer } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAddressAliasOutputs } from "../../../helpers/hooks/useAddressAliasOutputs";
import { useAddressBalance } from "../../../helpers/hooks/useAddressBalance";
import { useAddressBasicOutputs } from "../../../helpers/hooks/useAddressBasicOutputs";
import { useAddressNftOutputs } from "../../../helpers/hooks/useAddressNftOutputs";
import { useAliasControlledFoundries } from "../../../helpers/hooks/useAliasControlledFoundries";
import { useAliasDetails } from "../../../helpers/hooks/useAliasDetails";
import { useNftDetails } from "../../../helpers/hooks/useNftDetails";
import { scrollToTop } from "../../../helpers/pageUtils";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { TransactionsHelper } from "../../../helpers/stardust/transactionsHelper";
import { IBech32AddressDetails } from "../../../models/api/IBech32AddressDetails";
import NetworkContext from "../../context/NetworkContext";
import { AddressRouteProps } from "../AddressRouteProps";

export interface IAddressState {
    bech32AddressDetails: IBech32AddressDetails | null;
    balance: number | null;
    sigLockedBalance: number | null;
    storageRentBalance: number | null;
    addressOutputs: IOutputResponse[] | null;
    addressBasicOutputs: IOutputResponse[] | null;
    isBasicOutputsLoading: boolean;
    addressAliasOutputs: IOutputResponse[] | null;
    isAliasOutputsLoading: boolean;
    addressNftOutputs: IOutputResponse[] | null;
    isNftOutputsLoading: boolean;
    nftMetadata: HexEncodedString | null;
    nftIssuerId: string | null;
    isNftDetailsLoading: boolean;
    aliasOutput: IAliasOutput | null;
    isAliasDetailsLoading: boolean;
    aliasFoundries: string[] | null;
    isAliasFoundriesLoading: boolean;
    isAddressHistoryLoading: boolean;
    isAddressHistoryDisabled: boolean;
    isAssociatedOutputsLoading: boolean;
    tokensCount: number;
    nftCount: number;
    associatedOutputCount: number;
}

const initialState = {
    bech32AddressDetails: null,
    balance: null,
    sigLockedBalance: null,
    storageRentBalance: null,
    addressOutputs: null,
    addressBasicOutputs: null,
    isBasicOutputsLoading: true,
    addressAliasOutputs: null,
    isAliasOutputsLoading: true,
    addressNftOutputs: null,
    isNftOutputsLoading: true,
    nftMetadata: null,
    nftIssuerId: null,
    isNftDetailsLoading: true,
    aliasOutput: null,
    isAliasDetailsLoading: true,
    aliasFoundries: null,
    isAliasFoundriesLoading: true,
    isAddressHistoryLoading: true,
    isAddressHistoryDisabled: false,
    isAssociatedOutputsLoading: true,
    tokensCount: 0,
    nftCount: 0,
    associatedOutputCount: 0
};

/**
 * Route Location Props
 */
interface IAddressPageLocationProps {
    addressDetails: IBech32AddressDetails;
}

export const useAddressPageState = (): [IAddressState, React.Dispatch<Partial<IAddressState>>] => {
    const location = useLocation();
    const { network, address: addressFromPath } = useParams<AddressRouteProps>();
    const { bech32Hrp, rentStructure } = useContext(NetworkContext);

    const [state, setState] = useReducer<Reducer<IAddressState, Partial<IAddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }), initialState
    );

    const addressBech32: string | null = state.bech32AddressDetails?.bech32 ?? null;
    const addressHex: string | null = state.bech32AddressDetails?.hex ?? null;
    const [addressBasicOutputs, isBasicOutputsLoading] = useAddressBasicOutputs(network, addressBech32);
    const [addressAliasOutputs, isAliasOutputsLoading] = useAddressAliasOutputs(network, addressBech32);
    const [addressNftOutputs, isNftOutputsLoading] = useAddressNftOutputs(network, addressBech32);
    const [, nftMetadata, issuerId, isNftDetailsLoading] = useNftDetails(network, addressHex);
    const [aliasOutput, isAliasDetailsLoading] = useAliasDetails(network, addressHex);
    const [aliasFoundries, isAliasFoundriesLoading] = useAliasControlledFoundries(
        network, state.bech32AddressDetails
    );
    const [balance, sigLockedBalance] = useAddressBalance(
        network, state.bech32AddressDetails?.bech32 ?? null
    );

    useEffect(() => {
        const locationState = location.state as IAddressPageLocationProps;
        const { addressDetails } = locationState?.addressDetails ? locationState :
            { addressDetails: Bech32AddressHelper.buildAddress(bech32Hrp, addressFromPath) };

        const isBech32 = Bech32Helper.matches(addressFromPath, bech32Hrp);

        if (isBech32) {
            scrollToTop();
            setState({
                ...initialState,
                bech32AddressDetails: addressDetails
            });
        } else {
            setState(initialState);
        }
    }, [addressFromPath]);

    useEffect(() => {
        setState({
            addressBasicOutputs, isBasicOutputsLoading, addressAliasOutputs, isAliasOutputsLoading,
            addressNftOutputs, isNftOutputsLoading, nftMetadata, nftIssuerId: issuerId, isNftDetailsLoading,
            aliasOutput, isAliasDetailsLoading, aliasFoundries, isAliasFoundriesLoading,
            balance, sigLockedBalance
        });
    }, [
        addressBasicOutputs, isBasicOutputsLoading, addressAliasOutputs, isAliasOutputsLoading,
        addressNftOutputs, isNftOutputsLoading, nftMetadata, issuerId, isNftDetailsLoading,
        aliasOutput, isAliasDetailsLoading, aliasFoundries, isAliasFoundriesLoading,
        balance, sigLockedBalance
    ]);

    useEffect(() => {
        if (addressBasicOutputs && addressAliasOutputs && addressNftOutputs) {
            const mergedOutputResponses = [...addressBasicOutputs, ...addressAliasOutputs, ...addressNftOutputs];
            const outputs = mergedOutputResponses.map<OutputTypes>(or => or.output);
            const storageRentBalanceUpdate = TransactionsHelper.computeStorageRentBalance(
                outputs,
                rentStructure
            );

            setState({
                addressOutputs: mergedOutputResponses,
                storageRentBalance: storageRentBalanceUpdate
            });
        }
    }, [addressBasicOutputs, addressAliasOutputs, addressNftOutputs]);

    return [state, setState];
};

