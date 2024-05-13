import { Reducer, useEffect, useReducer } from "react";
import {
    AccountAddress,
    AccountOutput,
    BlockIssuerFeature,
    CongestionResponse,
    FeatureType,
    OutputWithMetadataResponse,
    StakingFeature,
    ValidatorResponse,
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
import { useAddressNftOutputs } from "~/helpers/nova/hooks/useAddressNftOutputs";
import { useAccountValidatorDetails } from "./useAccountValidatorDetails";
import { TransactionsHelper } from "../transactionsHelper";
import { useAddressDelegationOutputs } from "./useAddressDelegationOutputs";
import { IManaBalance } from "~/models/api/nova/address/IAddressBalanceResponse";
import { useOutputManaRewards } from "./useOutputManaRewards";
import { IDelegationWithDetails } from "~/models/api/nova/IDelegationWithDetails";
import { useValidatorDelegationOutputs } from "./useValidatorDelegationOutputs";

export interface IAccountAddressState {
    addressDetails: IAddressDetails | null;
    accountOutput: AccountOutput | null;
    storageDeposit: number | null;
    totalBaseTokenBalance: number | null;
    availableBaseTokenBalance: number | null;
    totalManaBalance: IManaBalance | null;
    availableManaBalance: IManaBalance | null;
    blockIssuerFeature: BlockIssuerFeature | null;
    manaRewards: bigint | null;
    stakingFeature: StakingFeature | null;
    validatorDetails: ValidatorResponse | null;
    addressBasicOutputs: OutputWithMetadataResponse[] | null;
    addressNftOutputs: OutputWithMetadataResponse[] | null;
    // This address is delegating output
    addressDelegationOutputs: IDelegationWithDetails[] | null;
    // This address is being delegated outputs to
    validatorDelegationOutputs: OutputWithMetadataResponse[] | null;
    foundries: string[] | null;
    congestion: CongestionResponse | null;
    isAccountDetailsLoading: boolean;
    isAssociatedOutputsLoading: boolean;
    isBasicOutputsLoading: boolean;
    isNftOutputsLoading: boolean;
    isDelegationOutputsLoading: boolean;
    isValidatorDelegationOutputsLoading: boolean;
    isFoundriesLoading: boolean;
    isAddressHistoryLoading: boolean;
    isAddressHistoryDisabled: boolean;
    isCongestionLoading: boolean;
    isValidatorDetailsLoading: boolean;
}

const initialState = {
    addressDetails: null,
    accountOutput: null,
    storageDeposit: null,
    totalBaseTokenBalance: null,
    availableBaseTokenBalance: null,
    totalManaBalance: null,
    availableManaBalance: null,
    blockIssuerFeature: null,
    manaRewards: null,
    stakingFeature: null,
    validatorDetails: null,
    addressBasicOutputs: null,
    addressNftOutputs: null,
    addressDelegationOutputs: null,
    validatorDelegationOutputs: null,
    foundries: null,
    congestion: null,
    isAccountDetailsLoading: true,
    isAssociatedOutputsLoading: false,
    isBasicOutputsLoading: false,
    isNftOutputsLoading: false,
    isDelegationOutputsLoading: false,
    isValidatorDelegationOutputsLoading: false,
    isFoundriesLoading: false,
    isAddressHistoryLoading: true,
    isAddressHistoryDisabled: false,
    isCongestionLoading: false,
    isValidatorDetailsLoading: false,
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
    const { bech32Hrp, protocolInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const [state, setState] = useReducer<Reducer<IAccountAddressState, Partial<IAccountAddressState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        initialState,
    );

    const { accountOutput, accountOutputMetadata, isLoading: isAccountDetailsLoading } = useAccountDetails(network, address.accountId);
    const { manaRewards: outputManaRewards } = useOutputManaRewards(
        network,
        accountOutputMetadata?.outputId ?? "",
        accountOutputMetadata?.spent?.slot,
    );

    const [addressBasicOutputs, isBasicOutputsLoading] = useAddressBasicOutputs(network, state.addressDetails?.bech32 ?? null);
    const [addressNftOutputs, isNftOutputsLoading] = useAddressNftOutputs(network, state.addressDetails?.bech32 ?? null);
    const [foundries, accountFoundryOutputs, isFoundriesLoading] = useAccountControlledFoundries(network, state.addressDetails);
    const [addressDelegationOutputs, isDelegationOutputsLoading] = useAddressDelegationOutputs(
        network,
        state.addressDetails?.bech32 ?? null,
    );
    const [validatorDelegationOutputs, isValidatorDelegationOutputsLoading] = useValidatorDelegationOutputs(
        network,
        state.addressDetails?.bech32 ?? null,
    );
    const { congestion, isLoading: isCongestionLoading } = useAccountCongestion(network, state.addressDetails?.hex ?? null);
    const { validatorDetails, isLoading: isValidatorDetailsLoading } = useAccountValidatorDetails(
        network,
        state.addressDetails?.hex ?? null,
    );

    const delegationRewards = addressDelegationOutputs?.map((output) => output.rewards?.manaRewards) ?? [];
    const allManaRewards = [outputManaRewards, ...delegationRewards].filter(Boolean) ?? [];
    const manaRewards =
        allManaRewards && allManaRewards.length > 0
            ? allManaRewards.reduce((total, rewardsResponse) => total + BigInt(rewardsResponse?.rewards ?? 0), BigInt(0))
            : null;
    const { totalBaseTokenBalance, availableBaseTokenBalance, totalManaBalance, availableManaBalance } = useAddressBalance(
        network,
        state.addressDetails,
        accountOutput,
        accountOutputMetadata,
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
    }, [address.accountId]);

    useEffect(() => {
        let updatedState: Partial<IAccountAddressState> = {
            accountOutput,
            isAccountDetailsLoading,
            totalBaseTokenBalance,
            availableBaseTokenBalance,
            totalManaBalance,
            availableManaBalance,
            manaRewards,
            foundries,
            congestion,
            validatorDetails,
            addressBasicOutputs,
            addressNftOutputs,
            addressDelegationOutputs,
            validatorDelegationOutputs,
            isBasicOutputsLoading,
            isNftOutputsLoading,
            isDelegationOutputsLoading,
            isValidatorDelegationOutputsLoading,
            isFoundriesLoading,
            isCongestionLoading,
            isValidatorDetailsLoading,
        };

        if (accountOutput) {
            const addressOutputs = [...(addressBasicOutputs ?? []), ...(addressNftOutputs ?? []), ...(accountFoundryOutputs ?? [])].map(
                ({ output }) => output,
            );
            if (protocolInfo?.parameters.storageScoreParameters) {
                const storageDeposit = TransactionsHelper.computeStorageDeposit(
                    [...addressOutputs, accountOutput],
                    protocolInfo?.parameters.storageScoreParameters,
                );
                updatedState = {
                    ...updatedState,
                    storageDeposit,
                };
            }

            if (!state.blockIssuerFeature) {
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

            if (!state.stakingFeature) {
                const stakingFeature = accountOutput?.features?.find((feature) => feature.type === FeatureType.Staking) as StakingFeature;
                if (stakingFeature) {
                    updatedState = {
                        ...updatedState,
                        stakingFeature,
                    };
                }
            }
        }

        setState(updatedState);
    }, [
        accountOutput,
        totalBaseTokenBalance,
        availableBaseTokenBalance,
        totalManaBalance,
        availableManaBalance,
        manaRewards,
        addressBasicOutputs,
        addressNftOutputs,
        accountFoundryOutputs,
        addressDelegationOutputs,
        validatorDelegationOutputs,
        congestion,
        validatorDetails,
        isAccountDetailsLoading,
        isBasicOutputsLoading,
        isNftOutputsLoading,
        isDelegationOutputsLoading,
        isValidatorDelegationOutputsLoading,
        isCongestionLoading,
        isValidatorDetailsLoading,
    ]);

    return [state, setState];
};
