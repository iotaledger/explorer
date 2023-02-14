import { ALIAS_ADDRESS_TYPE, Bech32Helper, IOutputResponse, NFT_ADDRESS_TYPE, OutputTypes } from "@iota/iota.js-stardust";
import { optional } from "@ruffy/ts-optional/dist/Optional";
import React, { useContext, useEffect, useState } from "react";
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
import NetworkContext from "../../context/NetworkContext";
import { AddressRouteProps } from "../AddressRouteProps";
import "./AddressPage.scss";


interface IAddressPageLocationProps {
    /**
     * address details from location props
     */
    addressDetails: IBech32AddressDetails;
}

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
    { location, match: { params: { network, address } } }
) => {
    const isMounted = useIsMounted();
    const { bech32Hrp, rentStructure } = useContext(NetworkContext);
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [bech32AddressDetails, setBech32AddressDetails] = useState<IBech32AddressDetails | null>(null);
    const [balance, setBalance] = useState<number | null>(null);
    const [sigLockedBalance, setSigLockedBalance] = useState<number | null>(null);
    const [storageRentBalance, setStorageRentBalance] = useState<number | null>(null);
    const [addressOutputs, setAddressOutputs] = useState<IOutputResponse[] | undefined>();
    const [addressBasicOutputs, isBasicOutputsLoading] = useAddressBasicOutputs(network, bech32AddressDetails?.bech32);
    const [addressAliasOutputs, isAliasOutputsLoading] = useAddressAliasOutputs(network, bech32AddressDetails?.bech32);
    const [addressNftOutputs, isNftOutputsLoading] = useAddressNftOutputs(network, bech32AddressDetails?.bech32);
    const [, nftMetadata, nftIssuerId, isNftDetailsLoading] = useNftDetails(network, bech32AddressDetails?.hex);
    const [aliasOutput, isAliasDetailsLoading] = useAliasDetails(network, bech32AddressDetails?.hex);
    const [aliasFoundries, isAliasFoundriesLoading] = useAliasControlledFoundries(
        network, bech32AddressDetails ?? undefined
    );
    const [isAddressHistoryLoading, setIsAddressHistoryLoading] = useState(true);
    const [isAddressHistoryDisabled, setIsAddressHistoryDisabled] = useState(false);
    const [isAssociatedOutputsLoading, setIsAssociatedOutputsLoading] = useState(true);

    const [tokensCount, setTokenCount] = useState<number>(0);
    const [nftCount, setNftCount] = useState<number>(0);
    const [associatedOutputCount, setAssociatedOutputCount] = useState<number>(0);

    useEffect(() => {
        const locationState = location.state as IAddressPageLocationProps;
        const { addressDetails } = locationState?.addressDetails ? locationState :
            { addressDetails: Bech32AddressHelper.buildAddress(bech32Hrp, address) };

        const isBech32 = Bech32Helper.matches(address, bech32Hrp);

        if (isBech32) {
            scrollToTop();
            // reset balances
            setBalance(null);
            setSigLockedBalance(null);
            setStorageRentBalance(null);
            setBech32AddressDetails(addressDetails);
        } else {
            setBech32AddressDetails(null);
        }
    }, [address]);

    useEffect(() => {
        if (bech32AddressDetails) {
            // eslint-disable-next-line no-void
            void getAddressBalance();
        }
    }, [bech32AddressDetails]);

    useEffect(() => {
        if (addressBasicOutputs && addressAliasOutputs && addressNftOutputs) {
            const outputResponses = [...addressBasicOutputs, ...addressAliasOutputs, ...addressNftOutputs];
            const outputs = outputResponses.map<OutputTypes>(or => or.output);
            const storageRentBalanceUpdate = TransactionsHelper.computeStorageRentBalance(
                outputs,
                rentStructure
            );
            setAddressOutputs(outputResponses);
            setStorageRentBalance(storageRentBalanceUpdate);
        }
    }, [addressBasicOutputs, addressAliasOutputs, addressNftOutputs]);

    /**
     * Fetch the address balance details.
     */
    async function getAddressBalance(): Promise<void> {
        optional(bech32AddressDetails?.bech32).foreach(async addr => {
            const response = await tangleCacheService.addressBalanceFromChronicle({
                network,
                address: addr
            });

            if (response?.totalBalance !== undefined) {
                if (isMounted) {
                    setBalance(response.totalBalance);
                    setSigLockedBalance(response.sigLockedBalance ?? null);
                }
            } else {
                // Fallback balance from iotajs (node)
                const addressDetailsWithBalance = await tangleCacheService.addressBalance(
                    { network, address: addr }
                );

                if (addressDetailsWithBalance && isMounted) {
                    setBalance(Number(addressDetailsWithBalance.balance));
                    setSigLockedBalance(null);
                }
            }
        });
    }

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

    /**
     * Tabbed sections.
     */
    const defaultSections = [
        <TransactionHistory
            key={`txs-history-${address}`}
            network={network}
            address={addressBech32}
            setLoading={setIsAddressHistoryLoading}
            setDisabled={setIsAddressHistoryDisabled}
        />,
        <AssetsTable
            key={`assets-table-${address}`}
            networkId={network}
            outputs={addressOutputs?.map(output => output.output)}
            setTokenCount={setTokenCount}
        />,
        <NftSection
            key={`nft-section-${address}`}
            network={network}
            bech32Address={addressBech32}
            outputs={addressNftOutputs}
            setNftCount={setNftCount}
        />,
        <AssociatedOutputs
            key={`assoc-outputs-${address}`}
            network={network}
            addressDetails={bech32AddressDetails ?? {} as IBech32AddressDetails}
            setOutputCount={setAssociatedOutputCount}
            setIsLoading={setIsAssociatedOutputsLoading}
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
            network={network}
            nftId={bech32AddressDetails.hex}
            issuerId={nftIssuerId}
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

