import {
    HexEncodedString, AliasOutput, MetadataFeature, OutputResponse,
    OutputType, AddressType, Output, BasicOutput, FeatureType
} from "@iota/iota.js-stardust";
import { Converter, ReadStream } from "@iota/util.js-stardust";
import { Reducer, useContext, useEffect, useReducer } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAddressAliasOutputs } from "../../../helpers/hooks/useAddressAliasOutputs";
import { useAddressBalance } from "../../../helpers/hooks/useAddressBalance";
import { useAddressBasicOutputs } from "../../../helpers/hooks/useAddressBasicOutputs";
import { useAddressNftOutputs } from "../../../helpers/hooks/useAddressNftOutputs";
import { useAliasControlledFoundries } from "../../../helpers/hooks/useAliasControlledFoundries";
import { useAliasDetails } from "../../../helpers/hooks/useAliasDetails";
import { useNftDetails } from "../../../helpers/hooks/useNftDetails";
import { IEventDetails, useParticipationEventDetails } from "../../../helpers/hooks/useParticipationEventDetails";
import { scrollToTop } from "../../../helpers/pageUtils";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { deserializeParticipationEventMetadata } from "../../../helpers/stardust/participationUtils";
import { TransactionsHelper } from "../../../helpers/stardust/transactionsHelper";
import { IBech32AddressDetails } from "../../../models/api/IBech32AddressDetails";
import { IParticipation } from "../../../models/api/stardust/participation/IParticipation";
import NetworkContext from "../../context/NetworkContext";
import { AddressRouteProps } from "../AddressRouteProps";

export interface IAddressState {
    bech32AddressDetails: IBech32AddressDetails | null;
    balance: number | null;
    sigLockedBalance: number | null;
    storageRentBalance: number | null;
    addressOutputs: OutputResponse[] | null;
    addressBasicOutputs: OutputResponse[] | null;
    isBasicOutputsLoading: boolean;
    addressAliasOutputs: OutputResponse[] | null;
    isAliasOutputsLoading: boolean;
    addressNftOutputs: OutputResponse[] | null;
    isNftOutputsLoading: boolean;
    nftMetadata: HexEncodedString | null;
    nftIssuerId: string | null;
    isNftDetailsLoading: boolean;
    aliasOutput: AliasOutput | null;
    isAliasDetailsLoading: boolean;
    aliasFoundries: string[] | null;
    isAliasFoundriesLoading: boolean;
    isAddressHistoryLoading: boolean;
    isAddressHistoryDisabled: boolean;
    isAssociatedOutputsLoading: boolean;
    participations: IParticipation[] | null;
    eventDetails: IEventDetails[] | null;
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
    participations: null,
    eventDetails: null,
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
    const addressType: number | null = state.bech32AddressDetails?.type ?? null;
    const [addressBasicOutputs, isBasicOutputsLoading] = useAddressBasicOutputs(network, addressBech32);
    const [addressAliasOutputs, isAliasOutputsLoading] = useAddressAliasOutputs(network, addressBech32);
    const [addressNftOutputs, isNftOutputsLoading] = useAddressNftOutputs(network, addressBech32);
    const [, nftMetadata, issuerId, isNftDetailsLoading] = useNftDetails(
        network, addressType === AddressType.Nft ? addressHex : null
    );
    const [aliasOutput, isAliasDetailsLoading] = useAliasDetails(
        network, addressType === AddressType.Alias ? addressHex : null
    );
    const [aliasFoundries, isAliasFoundriesLoading] = useAliasControlledFoundries(
        network, addressType === AddressType.Alias ? state.bech32AddressDetails : null
    );
    const [balance, sigLockedBalance] = useAddressBalance(
        network, state.bech32AddressDetails?.bech32 ?? null
    );
    const [eventDetails] = useParticipationEventDetails(state.participations ?? undefined);


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
            balance, sigLockedBalance, eventDetails
        });
    }, [
        addressBasicOutputs, isBasicOutputsLoading, addressAliasOutputs, isAliasOutputsLoading,
        addressNftOutputs, isNftOutputsLoading, nftMetadata, issuerId, isNftDetailsLoading,
        aliasOutput, isAliasDetailsLoading, aliasFoundries, isAliasFoundriesLoading,
        balance, sigLockedBalance, eventDetails
    ]);

    useEffect(() => {
        if (addressBasicOutputs && addressAliasOutputs && addressNftOutputs) {
            const mergedOutputResponses = [...addressBasicOutputs, ...addressAliasOutputs, ...addressNftOutputs];
            const outputs = mergedOutputResponses.map<Output>(or => or.output);
            const storageRentBalanceUpdate = TransactionsHelper.computeStorageRentBalance(
                outputs,
                rentStructure
            );

            setState({
                addressOutputs: mergedOutputResponses,
                storageRentBalance: storageRentBalanceUpdate
            });
        }
        if (addressBasicOutputs && !state.participations) {
            let foundParticipations: IParticipation[] = [];
            for (const outputResponse of addressBasicOutputs) {
                if (outputResponse.output.getType() === OutputType.Basic &&
                    TransactionsHelper.isParticipationEventOutput(outputResponse.output)
                ) {
                    const metadataFeature = (outputResponse.output as BasicOutput).getFeatures()?.find(
                        feature => feature.getType() === FeatureType.Metadata
                    ) as MetadataFeature;

                    if (metadataFeature) {
                        const readStream = new ReadStream(Converter.hexToBytes(metadataFeature.getData()));
                        const newParticipations = deserializeParticipationEventMetadata(readStream);
                        foundParticipations = [...foundParticipations, ...newParticipations];
                    }
                }
            }
            if (foundParticipations.length > 0) {
                setState({
                    participations: foundParticipations
                });
            }
        }
    }, [addressBasicOutputs, addressAliasOutputs, addressNftOutputs]);

    return [state, setState];
};

