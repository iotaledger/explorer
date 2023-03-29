import { ALIAS_ADDRESS_TYPE, NFT_ADDRESS_TYPE } from "@iota/iota.js-stardust";
import React from "react";
import nativeTokensMessage from "../../../../../assets/modals/stardust/address/assets-in-wallet.json";
import associatedOuputsMessage from "../../../../../assets/modals/stardust/address/associated-outputs.json";
import addressNftsMessage from "../../../../../assets/modals/stardust/address/nfts-in-wallet.json";
import transactionHistoryMessage from "../../../../../assets/modals/stardust/address/transaction-history.json";
import foundriesMessage from "../../../../../assets/modals/stardust/alias/foundries.json";
import stateMessage from "../../../../../assets/modals/stardust/alias/state.json";
import nftMetadataMessage from "../../../../../assets/modals/stardust/nft/metadata.json";
import { IAddressState } from "../../../../routes/stardust/AddressState";
import TabbedSection from "../../../hoc/TabbedSection";
import TransactionHistory from "../../history/TransactionHistory";
import AliasFoundriesSection from "./alias/AliasFoundriesSection";
import AliasStateSection from "./alias/AliasStateSection";
import AssociatedOutputs from "./association/AssociatedOutputs";
import AssetsTable from "./native-tokens/AssetsTable";
import NftMetadataSection from "./nft/NftMetadataSection";
import NftSection from "./nft/NftSection";

enum DEFAULT_TABS {
    Transactions = "Transactions",
    NativeTokens = "Native Tokens",
    Nfts = "NFTs",
    AssocOutputs = "Associated Outputs"
}

enum ALIAS_TABS {
    State = "State",
    Foundries = "Foundries",
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
    isAssociatedOutputsLoading: boolean
) => ({
    [DEFAULT_TABS.Transactions]: {
        disabled: false,
        isLoading: isAddressHistoryLoading,
        infoContent: transactionHistoryMessage
    },
    [DEFAULT_TABS.NativeTokens]: {
        disabled: tokensCount === 0,
        counter: tokensCount,
        isLoading: isAddressOutputsLoading,
        infoContent: nativeTokensMessage
    },
    [DEFAULT_TABS.Nfts]: {
        disabled: nftCount === 0,
        counter: nftCount,
        isLoading: isNftOutputsLoading,
        infoContent: addressNftsMessage
    },
    [DEFAULT_TABS.AssocOutputs]: {
        disabled: associatedOutputCount === 0,
        counter: associatedOutputCount,
        isLoading: isAssociatedOutputsLoading,
        infoContent: associatedOuputsMessage
    }
});

const buildAliasAddressTabsOptions = (
    isAliasStateTabDisabled: boolean,
    isAliasDetailsLoading: boolean,
    isAliasFoundriesTabDisabled: boolean,
    isAliasFoundriesLoading: boolean
) => ({
    [ALIAS_TABS.State]: {
        disabled: isAliasStateTabDisabled,
        isLoading: isAliasDetailsLoading,
        infoContent: stateMessage
    },
    [ALIAS_TABS.Foundries]: {
        disabled: isAliasFoundriesTabDisabled,
        isLoading: isAliasFoundriesLoading,
        infoContent: foundriesMessage
    }
});

const buildNftAddressTabsOptions = (
    isNftMetadataTabDisabled: boolean,
    isNftDetailsLoading: boolean
) => ({
    [NFT_TABS.NftMetadata]: {
        disabled: isNftMetadataTabDisabled,
        isLoading: isNftDetailsLoading,
        infoContent: nftMetadataMessage
    }
});

interface IAddressPageTabbedSectionsProps {
    network: string;
    addressPageState: IAddressState;
    setTransactionHistoryLoading: (isLoading: boolean) => void;
    setTransactionHistoryDisabled: (isDisabled: boolean) => void;
    setTokenCount: (count: number) => void;
    setNftCount: (count: number) => void;
    setAssociatedOutputsCount: (count: number) => void;
    setAssociatedOutputsLoading: (isLoading: boolean) => void;
}

export const AddressPageTabbedSections: React.FC<IAddressPageTabbedSectionsProps> = (
    {
        network,
        addressPageState,
        setTransactionHistoryLoading,
        setTransactionHistoryDisabled,
        setTokenCount,
        setNftCount,
        setAssociatedOutputsCount,
        setAssociatedOutputsLoading
    }
) => {
    const {
        bech32AddressDetails,
        addressOutputs, isBasicOutputsLoading,
        isAliasOutputsLoading,
        addressNftOutputs, isNftOutputsLoading,
        nftMetadata, nftIssuerId, isNftDetailsLoading,
        aliasOutput, isAliasDetailsLoading,
        aliasFoundries, isAliasFoundriesLoading,
        isAddressHistoryLoading, isAddressHistoryDisabled,
        isAssociatedOutputsLoading,
        tokensCount, nftCount, associatedOutputCount
    } = addressPageState;

    if (!bech32AddressDetails) {
        return null;
    }

    const addressBech32 = bech32AddressDetails.bech32;
    const addressHex = bech32AddressDetails.hex ?? "";
    const addressType = bech32AddressDetails.type;
    const isAddressOutputsLoading = isBasicOutputsLoading || isAliasOutputsLoading || isNftOutputsLoading;
    const nft = { nftId: addressHex, issuerId: nftIssuerId, metadata: nftMetadata };

    const defaultSections = [
        <TransactionHistory
            key={`txs-history-${addressBech32}`}
            network={network}
            address={addressBech32}
            setLoading={setTransactionHistoryLoading}
            setDisabled={setTransactionHistoryDisabled}
        />,
        <AssetsTable
            key={`assets-table-${addressBech32}`}
            networkId={network}
            outputs={addressOutputs}
            setTokenCount={setTokenCount}
        />,
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
        />
    ];

    const aliasAddressSections = addressType !== ALIAS_ADDRESS_TYPE ? null : [
        <AliasStateSection
            key={`alias-state-${addressBech32}`}
            output={aliasOutput}
        />,
        <AliasFoundriesSection
            key={`alias-foundry-${addressBech32}`}
            network={network}
            foundries={aliasFoundries}
        />
    ];

    const nftAddressSections = addressType !== NFT_ADDRESS_TYPE ? null : [
        <NftMetadataSection
            key={`nft-meta-${addressBech32}`}
            network={network}
            nft={nft}
            isLoading={isNftDetailsLoading}
        />
    ];

    let tabEnums = DEFAULT_TABS;
    const defaultTabsOptions = buildDefaultTabsOptions(
        isAddressHistoryLoading, tokensCount, isAddressOutputsLoading,
        nftCount, isNftOutputsLoading, associatedOutputCount, isAssociatedOutputsLoading
    );
    let tabOptions = defaultTabsOptions;
    let tabbedSections = defaultSections;

    switch (addressType) {
        case ALIAS_ADDRESS_TYPE:
            tabOptions[DEFAULT_TABS.Transactions].disabled = isAddressHistoryDisabled;
            tabEnums = { ...ALIAS_TABS, ...DEFAULT_TABS };
            tabOptions = {
                ...buildAliasAddressTabsOptions(
                    !aliasOutput,
                    isAliasDetailsLoading,
                    !aliasFoundries,
                    isAliasFoundriesLoading
                ),
                ...defaultTabsOptions
            };
            tabbedSections = [...(aliasAddressSections ?? []), ...defaultSections];
            break;
        case NFT_ADDRESS_TYPE:
            tabOptions[DEFAULT_TABS.Transactions].disabled = isAddressHistoryDisabled;
            tabEnums = { ...NFT_TABS, ...DEFAULT_TABS };
            tabOptions = {
                ...buildNftAddressTabsOptions(
                    !nftMetadata,
                    isNftDetailsLoading
                ),
                ...tabOptions
            };
            tabbedSections = [...(nftAddressSections ?? []), ...defaultSections];
            break;
        default:
            break;
    }

    return (
        <TabbedSection
            key={addressBech32}
            tabsEnum={tabEnums}
            tabOptions={tabOptions}
        >
            {tabbedSections}
        </TabbedSection>
    );
};

