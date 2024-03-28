import { AddressType } from "@iota/sdk-wasm-stardust/web";
import React from "react";
import AliasFoundriesSection from "./alias/AliasFoundriesSection";
import AliasStateSection from "./alias/AliasStateSection";
import AssociatedOutputs from "./association/AssociatedOutputs";
import DIDSection from "./did/DidSection";
import AssetsTable from "./native-tokens/AssetsTable";
import NftMetadataSection from "./nft/NftMetadataSection";
import NftSection from "./nft/NftSection";
import VotingSection from "./voting/VotingSection";
import nativeTokensMessage from "~assets/modals/stardust/address/assets-in-wallet.json";
import associatedOuputsMessage from "~assets/modals/stardust/address/associated-outputs.json";
import addressNftsMessage from "~assets/modals/stardust/address/nfts-in-wallet.json";
import transactionHistoryMessage from "~assets/modals/stardust/address/transaction-history.json";
import foundriesMessage from "~assets/modals/stardust/alias/foundries.json";
import didMessage from "~assets/modals/stardust/alias/did.json";
import stateMessage from "~assets/modals/stardust/alias/state.json";
import nftMetadataMessage from "~assets/modals/stardust/nft/metadata.json";
import votingMessage from "~assets/modals/stardust/participation/main-header.json";
import { IAddressState } from "../../../../routes/stardust/AddressState";
import TabbedSection from "../../../hoc/TabbedSection";
import TransactionHistory from "../../history/TransactionHistory";

enum DEFAULT_TABS {
    Transactions = "Transactions",
    NativeTokens = "Native Tokens",
    Nfts = "NFTs",
    AssocOutputs = "Associated Outputs",
    Voting = "Voting",
}

enum ALIAS_TABS {
    State = "State",
    Foundries = "Foundries",
    DID = "DID",
}

enum NFT_TABS {
    NftMetadata = "Metadata",
}

const buildDefaultTabsOptions = (
    isAddressHistoryLoading: boolean,
    tokensCount: number,
    isAddressOutputsLoading: boolean,
    nftCount: number,
    isNftOutputsLoading: boolean,
    associatedOutputCount: number,
    isAssociatedOutputsLoading: boolean,
    eventDetailsCount?: number,
) => ({
    [DEFAULT_TABS.Transactions]: {
        disabled: false,
        hidden: false,
        isLoading: isAddressHistoryLoading,
        infoContent: transactionHistoryMessage,
    },
    [DEFAULT_TABS.NativeTokens]: {
        disabled: tokensCount === 0,
        hidden: tokensCount === 0,
        counter: tokensCount,
        isLoading: isAddressOutputsLoading,
        infoContent: nativeTokensMessage,
    },
    [DEFAULT_TABS.Nfts]: {
        disabled: nftCount === 0,
        hidden: nftCount === 0,
        counter: nftCount,
        isLoading: isNftOutputsLoading,
        infoContent: addressNftsMessage,
    },
    [DEFAULT_TABS.AssocOutputs]: {
        disabled: associatedOutputCount === 0,
        hidden: associatedOutputCount === 0,
        counter: associatedOutputCount,
        isLoading: isAssociatedOutputsLoading,
        infoContent: associatedOuputsMessage,
    },
    [DEFAULT_TABS.Voting]: {
        disabled: false,
        counter: eventDetailsCount,
        infoContent: votingMessage,
        hidden: !eventDetailsCount,
    },
});

const buildAliasAddressTabsOptions = (
    isAliasStateTabDisabled: boolean,
    isAliasDetailsLoading: boolean,
    isAliasFoundriesTabDisabled: boolean,
    isAliasFoundriesLoading: boolean,
    isAliasDIDTabDisabled: boolean,
    isAliasDIDLoading: boolean,
) => ({
    [ALIAS_TABS.State]: {
        disabled: isAliasStateTabDisabled,
        hidden: isAliasStateTabDisabled,
        isLoading: isAliasDetailsLoading,
        infoContent: stateMessage,
    },
    [ALIAS_TABS.Foundries]: {
        disabled: isAliasFoundriesTabDisabled,
        hidden: isAliasFoundriesTabDisabled,
        isLoading: isAliasFoundriesLoading,
        infoContent: foundriesMessage,
    },
    [ALIAS_TABS.DID]: {
        disabled: isAliasDIDTabDisabled,
        hidden: isAliasDIDTabDisabled,
        isLoading: isAliasDIDLoading,
        infoContent: didMessage,
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
    readonly network: string;
    readonly addressPageState: IAddressState;
    readonly setTransactionHistoryLoading: (isLoading: boolean) => void;
    readonly setTransactionHistoryDisabled: (isDisabled: boolean) => void;
    readonly setTokenCount: (count: number) => void;
    readonly setNftCount: (count: number) => void;
    readonly setAssociatedOutputsCount: (count: number) => void;
    readonly setAssociatedOutputsLoading: (isLoading: boolean) => void;
}

export const AddressPageTabbedSections: React.FC<IAddressPageTabbedSectionsProps> = ({
    network,
    addressPageState,
    setTransactionHistoryLoading,
    setTransactionHistoryDisabled,
    setTokenCount,
    setNftCount,
    setAssociatedOutputsCount,
    setAssociatedOutputsLoading,
}) => {
    const {
        bech32AddressDetails,
        addressOutputs,
        isBasicOutputsLoading,
        isAliasOutputsLoading,
        addressNftOutputs,
        isNftOutputsLoading,
        nftMetadata,
        nftIssuerId,
        isNftDetailsLoading,
        aliasOutput,
        isAliasDetailsLoading,
        aliasFoundries,
        isAliasFoundriesLoading,
        isAddressHistoryLoading,
        isAddressHistoryDisabled,
        isAssociatedOutputsLoading,
        tokensCount,
        nftCount,
        associatedOutputCount,
        eventDetails,
        aliasContainsDID,
        resolvedDID,
        isDIDLoading,
    } = addressPageState;

    if (!bech32AddressDetails) {
        return null;
    }

    const addressBech32 = bech32AddressDetails.bech32;
    const addressHex = bech32AddressDetails.hex ?? "";
    const addressType = bech32AddressDetails.type;
    const isAddressOutputsLoading = isBasicOutputsLoading || isAliasOutputsLoading || isNftOutputsLoading;
    const nft = { nftId: addressHex, issuerId: nftIssuerId, metadata: nftMetadata };
    const eventDetailsCount = eventDetails?.length;

    const defaultSections = [
        <TransactionHistory
            key={`txs-history-${addressBech32}`}
            network={network}
            address={addressBech32}
            setLoading={setTransactionHistoryLoading}
            setDisabled={setTransactionHistoryDisabled}
        />,
        <AssetsTable key={`assets-table-${addressBech32}`} networkId={network} outputs={addressOutputs} setTokenCount={setTokenCount} />,
        <NftSection
            key={`nft-section-${addressBech32}`}
            network={network}
            bech32Address={addressBech32}
            outputs={addressNftOutputs}
            setNftCount={setNftCount}
        />,
        <AssociatedOutputs
            key={`assoc-outputs-${addressBech32}`}
            network={network}
            addressDetails={bech32AddressDetails}
            setOutputCount={setAssociatedOutputsCount}
            setIsLoading={setAssociatedOutputsLoading}
        />,
        <VotingSection key={`voting-${addressBech32}`} eventDetails={eventDetails ?? []} />,
    ];

    const aliasAddressSections =
        addressType === AddressType.Alias
            ? [
                  <AliasStateSection key={`alias-state-${addressBech32}`} output={aliasOutput} />,
                  <AliasFoundriesSection key={`alias-foundry-${addressBech32}`} network={network} foundries={aliasFoundries} />,
                  <DIDSection key={`did-${addressBech32}`} resolvedDID={resolvedDID} network={network} />,
              ]
            : null;

    const nftAddressSections =
        addressType === AddressType.Nft
            ? [<NftMetadataSection key={`nft-meta-${addressBech32}`} network={network} nft={nft} isLoading={isNftDetailsLoading} />]
            : null;

    let tabEnums = DEFAULT_TABS;
    const defaultTabsOptions = buildDefaultTabsOptions(
        isAddressHistoryLoading,
        tokensCount,
        isAddressOutputsLoading,
        nftCount,
        isNftOutputsLoading,
        associatedOutputCount,
        isAssociatedOutputsLoading,
        eventDetailsCount,
    );
    let tabOptions = defaultTabsOptions;
    let tabbedSections = defaultSections;

    switch (addressType) {
        case AddressType.Alias: {
            tabOptions[DEFAULT_TABS.Transactions].disabled = isAddressHistoryDisabled;
            tabOptions[DEFAULT_TABS.Transactions].hidden = isAddressHistoryDisabled;
            tabEnums = { ...ALIAS_TABS, ...DEFAULT_TABS };
            tabOptions = {
                ...buildAliasAddressTabsOptions(
                    !aliasOutput,
                    isAliasDetailsLoading,
                    !aliasFoundries,
                    isAliasFoundriesLoading,
                    !aliasContainsDID,
                    isDIDLoading,
                ),
                ...defaultTabsOptions,
            };
            tabbedSections = [...(aliasAddressSections ?? []), ...defaultSections];
            break;
        }
        case AddressType.Nft: {
            tabOptions[DEFAULT_TABS.Transactions].disabled = isAddressHistoryDisabled;
            tabOptions[DEFAULT_TABS.Transactions].hidden = isAddressHistoryDisabled;
            tabEnums = { ...NFT_TABS, ...DEFAULT_TABS };
            tabOptions = {
                ...buildNftAddressTabsOptions(!nftMetadata, isNftDetailsLoading),
                ...tabOptions,
            };
            tabbedSections = [...(nftAddressSections ?? []), ...defaultSections];
            break;
        }
        default: {
            break;
        }
    }

    return (
        <TabbedSection key={addressBech32} tabsEnum={tabEnums} tabOptions={tabOptions}>
            {tabbedSections}
        </TabbedSection>
    );
};
