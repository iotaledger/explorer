import { Bech32Helper, IAliasOutput, IOutputResponse, OutputTypes } from "@iota/iota.js-stardust";
import { Reducer, useContext, useEffect, useReducer, useState } from "react";
import { useLocation } from "react-router-dom";
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

export interface IAddressState {
    bech32AddressDetails: IBech32AddressDetails | null;
    balance: number | null;
    sigLockedBalance: number | null;
    storageRentBalance: number | null;
    addressOutputs: IOutputResponse[] | undefined;
    addressBasicOutputs: IOutputResponse[] | null;
    isBasicOutputsLoading: boolean;
    addressAliasOutputs: IOutputResponse[] | null;
    isAliasOutputsLoading: boolean;
    addressNftOutputs: IOutputResponse[] | null;
    isNftOutputsLoading: boolean;
    nftMetadata: string | undefined;
    isNftDetailsLoading: boolean;
    aliasOutput: IAliasOutput | undefined;
    isAliasDetailsLoading: boolean;
    aliasFoundries: string[] | undefined;
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
    addressOutputs: undefined,
    addressBasicOutputs: null,
    isBasicOutputsLoading: true,
    addressAliasOutputs: null,
    isAliasOutputsLoading: true,
    addressNftOutputs: null,
    isNftOutputsLoading: true,
    nftMetadata: undefined,
    isNftDetailsLoading: true,
    aliasOutput: undefined,
    isAliasDetailsLoading: true,
    aliasFoundries: undefined,
    isAliasFoundriesLoading: true,
    isAddressHistoryLoading: true,
    isAddressHistoryDisabled: false,
    isAssociatedOutputsLoading: true,
    tokensCount: 0,
    nftCount: 0,
    associatedOutputCount: 0
};

interface IAddressPageLocationProps {
    /**
     * address details from location props
     */
    addressDetails: IBech32AddressDetails;
}

const useAddressData = (network: string, addressDetails: IBech32AddressDetails | null) => {
    const addressBech32: string | undefined = addressDetails?.bech32;
    const addressHex: string | undefined = addressDetails?.hex;
    const [addressBasicOutputs, isBasicOutputsLoading] = useAddressBasicOutputs(network, addressBech32);
    const [addressAliasOutputs, isAliasOutputsLoading] = useAddressAliasOutputs(network, addressBech32);
    const [addressNftOutputs, isNftOutputsLoading] = useAddressNftOutputs(network, addressBech32);
    const [nftOutput, nftMetadata, isNftDetailsLoading] = useNftDetails(network, addressHex);
    const [aliasOutput, isAliasDetailsLoading] = useAliasDetails(network, addressHex);
    const [aliasFoundries, isAliasFoundriesLoading] = useAliasControlledFoundries(network, addressDetails ?? undefined);
    return {
        addressBasicOutputs, isBasicOutputsLoading,
        addressAliasOutputs, isAliasOutputsLoading,
        addressNftOutputs, isNftOutputsLoading,
        nftOutput, nftMetadata, isNftDetailsLoading,
        aliasOutput, isAliasDetailsLoading,
        aliasFoundries, isAliasFoundriesLoading
    };
};

export const useAddressPageState = (
    network: string,
    addressFromPath: string
): [IAddressState, React.Dispatch<Partial<IAddressState>>] => {
    const isMounted = useIsMounted();
    const location = useLocation();
    const { bech32Hrp, rentStructure } = useContext(NetworkContext);
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );

    const [state, setState] = useReducer<Reducer<IAddressState, Partial<IAddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }), initialState
    );

    const addressData = useAddressData(network, state.bech32AddressDetails);

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
            ...addressData
        });
    }, [addressData]);

    useEffect(() => {
        const { addressBasicOutputs, addressAliasOutputs, addressNftOutputs } = state;
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
    }, [state.addressBasicOutputs, state.addressAliasOutputs, state.addressNftOutputs]);

    return [state, setState];
};

