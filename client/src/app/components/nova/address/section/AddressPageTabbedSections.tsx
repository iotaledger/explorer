import React, { useState } from "react";
import associatedOuputsMessage from "~assets/modals/stardust/address/associated-outputs.json";
import foundriesMessage from "~assets/modals/stardust/alias/foundries.json";
import stateMessage from "~assets/modals/stardust/alias/state.json";
import bicMessage from "~assets/modals/nova/account/bic.json";
import validatorMessage from "~assets/modals/nova/account/validator.json";
import nftMetadataMessage from "~assets/modals/stardust/nft/metadata.json";
import addressNftsMessage from "~assets/modals/stardust/address/nfts-in-wallet.json";
import TabbedSection from "../../../hoc/TabbedSection";
import AssociatedOutputs from "./association/AssociatedOutputs";
import nativeTokensMessage from "~assets/modals/stardust/address/assets-in-wallet.json";
import transactionHistoryMessage from "~assets/modals/stardust/address/transaction-history.json";
import { IAccountAddressState } from "~/helpers/nova/hooks/useAccountAddressState";
import { INftAddressState } from "~/helpers/nova/hooks/useNftAddressState";
import { IAnchorAddressState } from "~/helpers/nova/hooks/useAnchorAddressState";
import { IEd25519AddressState } from "~/helpers/nova/hooks/useEd25519AddressState";
import AssetsTable from "./native-tokens/AssetsTable";
import { IImplicitAccountCreationAddressState } from "~/helpers/nova/hooks/useImplicitAccountCreationAddressState";
import { AddressType } from "@iota/sdk-wasm-nova/web";
import AccountFoundriesSection from "./account/AccountFoundriesSection";
import TransactionHistory from "../../history/TransactionHistoryView";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import AccountBlockIssuanceSection from "./account/AccountBlockIssuanceSection";
import AnchorStateSection from "./anchor/AnchorStateSection";
import NftSection from "~/app/components/nova/address/section/nft/NftSection";
import NftMetadataSection from "~/app/components/nova/address/section/nft/NftMetadataSection";
import { TransactionsHelper } from "~/helpers/nova/transactionsHelper";
import AccountValidatorSection from "./account/AccountValidatorSection";

enum DEFAULT_TABS {
    Transactions = "Transactions",
    AssocOutputs = "Outputs",
    NativeTokens = "Native Tokens",
    Nfts = "NFTs",
}

enum ACCOUNT_TABS {
    BlockIssuance = "Block Issuance",
    Foundries = "Foundries",
    Validation = "Validation",
}

enum ANCHOR_TABS {
    State = "State",
}

enum NFT_TABS {
    NftMetadata = "Metadata",
}

const buildDefaultTabsOptions = (
    tokensCount: number,
    nftsCount: number,
    associatedOutputCount: number,
    isNativeTokensLoading: boolean,
    isNftOutputsLoading: boolean,
    isAddressHistoryLoading: boolean,
    isAddressHistoryDisabled: boolean,
) => ({
    [DEFAULT_TABS.Transactions]: {
        disabled: isAddressHistoryDisabled,
        hidden: isAddressHistoryDisabled,
        isLoading: isAddressHistoryLoading,
        infoContent: transactionHistoryMessage,
    },
    [DEFAULT_TABS.AssocOutputs]: {
        disabled: associatedOutputCount === 0,
        hidden: associatedOutputCount === 0,
        counter: associatedOutputCount,
        infoContent: associatedOuputsMessage,
    },
    [DEFAULT_TABS.NativeTokens]: {
        disabled: tokensCount === 0,
        hidden: tokensCount === 0,
        counter: tokensCount,
        isLoading: isNativeTokensLoading,
        infoContent: nativeTokensMessage,
    },
    [DEFAULT_TABS.Nfts]: {
        disabled: nftsCount === 0,
        hidden: nftsCount === 0,
        counter: nftsCount,
        isLoading: isNftOutputsLoading,
        infoContent: addressNftsMessage,
    },
});

const buildAccountAddressTabsOptions = (
    isBlockIssuer: boolean,
    isCongestionLoading: boolean,
    foundriesCount: number,
    hasStakingFeature: boolean,
    isAccountFoundriesLoading: boolean,
    isValidatorDetailsLoading: boolean,
) => ({
    [ACCOUNT_TABS.Foundries]: {
        disabled: foundriesCount === 0,
        hidden: foundriesCount === 0,
        isLoading: isAccountFoundriesLoading,
        infoContent: foundriesMessage,
    },
    [ACCOUNT_TABS.BlockIssuance]: {
        disabled: !isBlockIssuer,
        hidden: !isBlockIssuer,
        isLoading: isCongestionLoading,
        infoContent: bicMessage,
    },
    [ACCOUNT_TABS.Validation]: {
        disabled: !hasStakingFeature,
        hidden: !hasStakingFeature,
        isLoading: isValidatorDetailsLoading,
        infoContent: validatorMessage,
    },
});

const buildAnchorAddressTabsOptions = (isAnchorStateTabDisabled: boolean, isAnchorDetailsLoading: boolean) => ({
    [ANCHOR_TABS.State]: {
        disabled: isAnchorStateTabDisabled,
        hidden: isAnchorStateTabDisabled,
        isLoading: isAnchorDetailsLoading,
        infoContent: stateMessage,
    },
});

const buildNftAddressTabsOptions = (isNftMetadataTabDisabled: boolean, isNftDetailsLoading: boolean) => ({
    [NFT_TABS.NftMetadata]: {
        disabled: isNftMetadataTabDisabled,
        hidden: isNftMetadataTabDisabled,
        isLoading: isNftDetailsLoading,
        infoContent: nftMetadataMessage,
    },
});

interface IAddressPageTabbedSectionsProps {
    readonly addressState:
        | IEd25519AddressState
        | IAccountAddressState
        | INftAddressState
        | IAnchorAddressState
        | IImplicitAccountCreationAddressState;
    readonly setAssociatedOutputsLoading: (isLoading: boolean) => void;
    readonly setTransactionHistoryLoading: (isLoading: boolean) => void;
    readonly setTransactionHistoryDisabled: (isDisabled: boolean) => void;
}

export const AddressPageTabbedSections: React.FC<IAddressPageTabbedSectionsProps> = ({
    addressState,
    setAssociatedOutputsLoading,
    setTransactionHistoryLoading,
    setTransactionHistoryDisabled,
}) => {
    const [outputCount, setOutputCount] = useState<number>(0);
    const [tokensCount, setTokensCount] = useState<number>(0);
    const networkInfo = useNetworkInfoNova((s) => s.networkInfo);

    if (!addressState.addressDetails) {
        return null;
    }
    const { addressDetails, addressBasicOutputs, isAddressHistoryLoading, isAddressHistoryDisabled } = addressState;
    const { bech32: addressBech32 } = addressDetails;
    const { name: network } = networkInfo;

    const defaultSections = [
        <TransactionHistory
            key={`txs-history-${addressBech32}`}
            network={network}
            address={addressBech32}
            setLoading={setTransactionHistoryLoading}
            setDisabled={setTransactionHistoryDisabled}
        />,
        <AssociatedOutputs
            key={`assoc-outputs-${addressBech32}`}
            addressDetails={addressDetails}
            setOutputCount={setOutputCount}
            setIsLoading={setAssociatedOutputsLoading}
        />,
        <AssetsTable key={`assets-table-${addressBech32}`} outputs={addressBasicOutputs} setTokensCount={setTokensCount} />,
        <NftSection key={`nft-section-${addressBech32}`} outputs={addressState.addressNftOutputs} />,
    ];

    const accountAddressSections =
        addressDetails.type === AddressType.Account
            ? [
                  <AccountBlockIssuanceSection
                      key={`account-block-issuance-${addressBech32}`}
                      blockIssuerFeature={(addressState as IAccountAddressState).blockIssuerFeature}
                      congestion={(addressState as IAccountAddressState).congestion}
                  />,
                  <AccountFoundriesSection
                      key={`account-foundry-${addressBech32}`}
                      foundries={(addressState as IAccountAddressState).foundries}
                  />,
                  <AccountValidatorSection
                      key={`account-validator-${addressBech32}`}
                      validatorDetails={(addressState as IAccountAddressState).validatorDetails}
                  />,
              ]
            : null;

    const anchorAddressSections =
        addressDetails.type === AddressType.Anchor
            ? [<AnchorStateSection key={`anchor-state-${addressBech32}`} output={(addressState as IAnchorAddressState).anchorOutput} />]
            : null;

    const nftAddressSections =
        addressDetails.type === AddressType.Nft
            ? [<NftMetadataSection key={`nft-meta-${addressBech32}`} nftOutput={(addressState as INftAddressState).nftOutput} />]
            : null;

    let tabEnums = DEFAULT_TABS;
    const nftsCount = addressState.addressNftOutputs?.length ?? 0;
    const defaultTabsOptions = buildDefaultTabsOptions(
        tokensCount,
        nftsCount,
        outputCount,
        addressState.isBasicOutputsLoading,
        addressState.isNftOutputsLoading,
        isAddressHistoryLoading,
        isAddressHistoryDisabled,
    );
    let tabOptions = defaultTabsOptions;
    let tabbedSections = defaultSections;

    switch (addressDetails.type) {
        case AddressType.Account: {
            const accountAddressState = addressState as IAccountAddressState;
            tabEnums = { ...DEFAULT_TABS, ...ACCOUNT_TABS };
            tabOptions = {
                ...defaultTabsOptions,
                ...buildAccountAddressTabsOptions(
                    accountAddressState.blockIssuerFeature !== null,
                    accountAddressState.isCongestionLoading,
                    accountAddressState.accountOutput?.foundryCounter ?? 0,
                    accountAddressState.stakingFeature !== null,
                    accountAddressState.isFoundriesLoading,
                    accountAddressState.isValidatorDetailsLoading,
                ),
            };
            tabbedSections = [...defaultSections, ...(accountAddressSections ?? [])];
            break;
        }
        case AddressType.Nft: {
            const nftAddressState = addressState as INftAddressState;
            const nftMetadata = nftAddressState.nftOutput ? TransactionsHelper.getNftMetadataFeature(nftAddressState.nftOutput) : null;
            tabEnums = { ...DEFAULT_TABS, ...NFT_TABS };
            tabOptions = {
                ...tabOptions,
                ...buildNftAddressTabsOptions(!nftMetadata, nftAddressState.isNftDetailsLoading),
            };
            tabbedSections = [...defaultSections, ...(nftAddressSections ?? [])];
            break;
        }
        case AddressType.Anchor: {
            const anchorAddressState = addressState as IAnchorAddressState;
            tabEnums = { ...DEFAULT_TABS, ...ANCHOR_TABS };
            tabOptions = {
                ...defaultTabsOptions,
                ...buildAnchorAddressTabsOptions(anchorAddressState.anchorOutput === null, anchorAddressState.isAnchorDetailsLoading),
            };
            tabbedSections = [...defaultSections, ...(anchorAddressSections ?? [])];
            break;
        }
        default: {
            break;
        }
    }
    return (
        <TabbedSection key={addressDetails.bech32} tabsEnum={tabEnums} tabOptions={tabOptions}>
            {tabbedSections}
        </TabbedSection>
    );
};
