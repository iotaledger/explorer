import { Bech32Helper, IAliasOutput, IOutputResponse, OutputTypes } from "@iota/iota.js-stardust";
import { Reducer, useContext, useEffect, useReducer, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { useAddressAliasOutputs } from "../../../helpers/hooks/useAddressAliasOutputs";
import { useAddressBasicOutputs } from "../../../helpers/hooks/useAddressBasicOutputs";
import { useAddressNftOutputs } from "../../../helpers/hooks/useAddressNftOutputs";
import { useAliasControlledFoundries } from "../../../helpers/hooks/useAliasControlledFoundries";
import { useAliasDetails } from "../../../helpers/hooks/useAliasDetails";
import { useIsMounted } from "../../../helpers/hooks/useIsMounted";
import { useNftDetails } from "../../../helpers/hooks/useNftDetails";
import { scrollToTop } from "../../../helpers/pageUtils";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { TransactionsHelper } from "../../../helpers/stardust/transactionsHelper";
import { IBech32AddressDetails } from "../../../models/api/IBech32AddressDetails";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
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
    nftMetadata: string | null;
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
    const isMounted = useIsMounted();
    const location = useLocation();
    const { network, address: addressFromPath } = useParams<AddressRouteProps>();
    const { bech32Hrp, rentStructure } = useContext(NetworkContext);
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );

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

    useEffect(() => {
        const locationState = location.state as IAddressPageLocationProps;
        const { addressDetails } = locationState?.addressDetails ? locationState :
            { addressDetails: Bech32AddressHelper.buildAddress(bech32Hrp, addressFromPath) };

        const isBech32 = Bech32Helper.matches(addressFromPath, bech32Hrp);

        if (isBech32) {
            scrollToTop();
            setState({
                // reset balances
                balance: null,
                sigLockedBalance: null,
                storageRentBalance: null,
                bech32AddressDetails: addressDetails
            });
        } else {
            setState({
                bech32AddressDetails: null
            });
        }
    }, [addressFromPath]);

    useEffect(() => {
        if (state.bech32AddressDetails?.bech32) {
            const address = state.bech32AddressDetails.bech32;
            // eslint-disable-next-line no-void
            void (async () => {
                const response = await tangleCacheService.addressBalanceFromChronicle({ network, address });

                if (response?.totalBalance !== undefined) {
                    if (isMounted) {
                        setState({
                            balance: response.totalBalance,
                            sigLockedBalance: response.sigLockedBalance ?? null
                        });
                    }
                } else {
                    // Fallback balance from iotajs (node)
                    const addressDetailsWithBalance = await tangleCacheService.addressBalance({ network, address });

                    if (addressDetailsWithBalance && isMounted) {
                        setState({
                            balance: Number(addressDetailsWithBalance.balance),
                            sigLockedBalance: null
                        });
                    }
                }
            })();
        }
    }, [state.bech32AddressDetails]);

    useEffect(() => {
        setState({
            addressBasicOutputs, isBasicOutputsLoading, addressAliasOutputs, isAliasOutputsLoading,
            addressNftOutputs, isNftOutputsLoading, nftMetadata, nftIssuerId: issuerId, isNftDetailsLoading,
            aliasOutput, isAliasDetailsLoading, aliasFoundries, isAliasFoundriesLoading
        });
    }, [
        addressBasicOutputs, isBasicOutputsLoading, addressAliasOutputs, isAliasOutputsLoading,
        addressNftOutputs, isNftOutputsLoading, nftMetadata, issuerId, isNftDetailsLoading,
        aliasOutput, isAliasDetailsLoading, aliasFoundries, isAliasFoundriesLoading
    ]);

    useEffect(() => {
        if (addressBasicOutputs && addressAliasOutputs && addressNftOutputs) {
            const outputResponses = [...addressBasicOutputs, ...addressAliasOutputs, ...addressNftOutputs];
            const outputs = outputResponses.map<OutputTypes>(or => or.output);
            const storageRentBalanceUpdate = TransactionsHelper.computeStorageRentBalance(
                outputs,
                rentStructure
            );

            setState({
                addressOutputs: outputResponses,
                storageRentBalance: storageRentBalanceUpdate
            });
        }
    }, [addressBasicOutputs, addressAliasOutputs, addressNftOutputs]);

    return [state, setState];
};

