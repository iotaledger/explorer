import { ALIAS_ADDRESS_TYPE, NFT_ADDRESS_TYPE } from "@iota/iota.js-stardust";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import nativeTokensMessage from "../../../assets/modals/stardust/address/assets-in-wallet.json";
import associatedOuputsMessage from "../../../assets/modals/stardust/address/associated-outputs.json";
import addressMainHeaderInfo from "../../../assets/modals/stardust/address/main-header.json";
import addressNftsMessage from "../../../assets/modals/stardust/address/nfts-in-wallet.json";
import transactionHistoryMessage from "../../../assets/modals/stardust/address/transaction-history.json";
import foundriesMessage from "../../../assets/modals/stardust/alias/foundries.json";
import aliasMainHeaderInfo from "../../../assets/modals/stardust/alias/main-header.json";
import stateMessage from "../../../assets/modals/stardust/alias/state.json";
import nftMainHeaderInfo from "../../../assets/modals/stardust/nft/main-header.json";
import nftMetadataMessage from "../../../assets/modals/stardust/nft/metadata.json";
import { IBech32AddressDetails } from "../../../models/api/IBech32AddressDetails";
import TabbedSection from "../../components/hoc/TabbedSection";
import Modal from "../../components/Modal";
import NotFound from "../../components/NotFound";
import Spinner from "../../components/Spinner";
import AddressBalance from "../../components/stardust/AddressBalance";
import AliasFoundriesSection from "../../components/stardust/AliasFoundriesSection";
import AliasStateSection from "../../components/stardust/AliasStateSection";
import AssetsTable from "../../components/stardust/AssetsTable";
import AssociatedOutputs from "../../components/stardust/AssociatedOutputs";
import Bech32Address from "../../components/stardust/Bech32Address";
import TransactionHistory from "../../components/stardust/history/TransactionHistory";
import NftMetadataSection from "../../components/stardust/NftMetadataSection";
import NftSection from "../../components/stardust/NftSection";
import { AddressRouteProps } from "../AddressRouteProps";
import { useAddressPageState } from "./AddressState";
import "./AddressPage.scss";

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

const AddressPage: React.FC<RouteComponentProps<AddressRouteProps>> = (
    { match: { params: { network, address } } }
) => {
    const [state, setState] = useAddressPageState(network, address);
    const {
        bech32AddressDetails, balance, sigLockedBalance, storageRentBalance,
        addressOutputs, isBasicOutputsLoading,
        isAliasOutputsLoading,
        addressNftOutputs, isNftOutputsLoading,
        nftMetadata, isNftDetailsLoading,
        aliasOutput,
        isAliasDetailsLoading,
        aliasFoundries, isAliasFoundriesLoading,
        isAddressHistoryLoading, isAddressHistoryDisabled,
        isAssociatedOutputsLoading,
        tokensCount, nftCount, associatedOutputCount
    } = state;

    const addressBech32 = bech32AddressDetails?.bech32 ?? undefined;
    const addressType = bech32AddressDetails?.type ?? undefined;
    const isAddressOutputsLoading = isBasicOutputsLoading || isAliasOutputsLoading || isNftOutputsLoading;
    const isPageLoading = isAddressOutputsLoading ||
        isNftDetailsLoading ||
        isAddressHistoryLoading ||
        isAssociatedOutputsLoading;

    if (!bech32AddressDetails) {
        return (
            <div className="address-page">
                <div className="wrapper">
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>Address</h1>
                                <Modal icon="info" data={addressMainHeaderInfo} />
                            </div>
                        </div>
                        <NotFound
                            searchTarget="address"
                            query={address}
                        />
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Tab header options.
     */
    const defaultTabsOptions = {
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
    };

    const aliasTabsOptions = {
        [ALIAS_TABS.State]: {
            disabled: !aliasOutput,
            isLoading: isAliasDetailsLoading,
            infoContent: stateMessage
        },
        [ALIAS_TABS.Foundries]: {
            disabled: !aliasFoundries,
            isLoading: isAliasFoundriesLoading,
            infoContent: foundriesMessage
        }
    };

    const nftTabsOptions = {
        [NFT_TABS.NftMetadata]: {
            disabled: !nftMetadata,
            isLoading: isNftDetailsLoading,
            infoContent: nftMetadataMessage
        }
    };

    const defaultSections = [
        <TransactionHistory
            key={`txs-history-${address}`}
            network={network}
            address={addressBech32}
            setLoading={isLoading => setState({ isAddressHistoryLoading: isLoading })}
            setDisabled={isDisabled => setState({ isAddressHistoryDisabled: isDisabled })}
        />,
        <AssetsTable
            key={`assets-table-${address}`}
            networkId={network}
            outputs={addressOutputs?.map(output => output.output)}
            setTokenCount={count => setState({ tokensCount: count })}
        />,
        <NftSection
            key={`nft-section-${address}`}
            network={network}
            bech32Address={addressBech32}
            outputs={addressNftOutputs}
            setNftCount={count => setState({ nftCount: count })}
        />,
        <AssociatedOutputs
            key={`assoc-outputs-${address}`}
            network={network}
            addressDetails={bech32AddressDetails ?? {} as IBech32AddressDetails}
            setOutputCount={count => setState({ associatedOutputCount: count })}
            setIsLoading={isLoading => setState({ isAssociatedOutputsLoading: isLoading })}
        />
    ];

    const aliasSections = [
        <AliasStateSection
            key={`alias-state-${address}`}
            output={aliasOutput}
        />,
        <AliasFoundriesSection
            key={`alias-foundry-${address}`}
            network={network}
            foundries={aliasFoundries}
        />
    ];

    const nftSections = [
        <NftMetadataSection
            key={`nft-meta-${address}`}
            metadata={nftMetadata}
        />
    ];

    let addressMessage = addressMainHeaderInfo;
    let tabEnums = DEFAULT_TABS;
    let tabOptions = defaultTabsOptions;
    let tabbedSections = defaultSections;

    switch (addressType) {
        case ALIAS_ADDRESS_TYPE:
            defaultTabsOptions[DEFAULT_TABS.Transactions].disabled = isAddressHistoryDisabled;
            addressMessage = aliasMainHeaderInfo;
            tabEnums = { ...ALIAS_TABS, ...DEFAULT_TABS };
            tabOptions = { ...aliasTabsOptions, ...defaultTabsOptions };
            tabbedSections = [...aliasSections, ...defaultSections];
            break;
        case NFT_ADDRESS_TYPE:
            defaultTabsOptions[DEFAULT_TABS.Transactions].disabled = isAddressHistoryDisabled;
            addressMessage = nftMainHeaderInfo;
            tabEnums = { ...NFT_TABS, ...DEFAULT_TABS };
            tabOptions = { ...nftTabsOptions, ...defaultTabsOptions };
            tabbedSections = [...nftSections, ...defaultSections];
            break;
        default:
            break;
    }

    return (
        <div className="address-page">
            <div className="wrapper">
                {bech32AddressDetails && (
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>
                                    {bech32AddressDetails.typeLabel?.replace("Ed25519", "Address")}
                                </h1>
                                <Modal icon="info" data={addressMessage} />
                            </div>
                            {isPageLoading && <Spinner />}
                        </div>
                        <div className="section no-border-bottom">
                            <div className="section--header">
                                <div className="row middle">
                                    <h2>
                                        General
                                    </h2>
                                </div>
                            </div>
                            <div className="general-content">
                                <div className="section--data">
                                    <Bech32Address
                                        addressDetails={bech32AddressDetails}
                                        advancedMode={true}
                                    />
                                    {balance !== null && (
                                        <AddressBalance
                                            balance={balance}
                                            spendableBalance={sigLockedBalance}
                                            storageRentBalance={storageRentBalance}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <TabbedSection
                            key={address}
                            tabsEnum={tabEnums}
                            tabOptions={tabOptions}
                        >
                            {tabbedSections}
                        </TabbedSection>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddressPage;

