import { ALIAS_ADDRESS_TYPE, ED25519_ADDRESS_TYPE, IOutputResponse, NFT_ADDRESS_TYPE, OutputTypes } from "@iota/iota.js-stardust";
import { optional } from "@ruffy/ts-optional/dist/Optional";
import React, { useContext, useEffect, useState } from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { useAddressAliasOutputs } from "../../../helpers/hooks/useAddressAliasOutputs";
import { useAddressBasicOutputs } from "../../../helpers/hooks/useAddressBasicOutputs";
import { useAddressNftOutputs } from "../../../helpers/hooks/useAddressNftOutputs";
import { useIsMounted } from "../../../helpers/hooks/useIsMounted";
import { useNftDetails } from "../../../helpers/hooks/useNftDetails";
import { PromiseStatus } from "../../../helpers/promise/promiseMonitor";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { TransactionsHelper } from "../../../helpers/stardust/transactionsHelper";
import { IBech32AddressDetails } from "../../../models/api/IBech32AddressDetails";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import TabbedSection from "../../components/hoc/TabbedSection";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import AddressBalance from "../../components/stardust/AddressBalance";
import AssetsTable from "../../components/stardust/AssetsTable";
import AssociatedOutputs from "../../components/stardust/AssociatedOutputs";
import Bech32Address from "../../components/stardust/Bech32Address";
import FeaturesSection from "../../components/stardust/FeaturesSection";
import TransactionHistory from "../../components/stardust/history/TransactionHistory";
import NftMetadataSection from "../../components/stardust/NftMetadataSection";
import NftSection from "../../components/stardust/NftSection";
import NetworkContext from "../../context/NetworkContext";
import { AddressRouteProps } from "../AddressRouteProps";
import mainHeaderInfo from "./../../../assets/modals/stardust/address/main-header.json";
import "./AddressPage.scss";

interface IAddressPageLocationProps {
    /**
     * address details from location props
     */
    addressDetails: IBech32AddressDetails;
}

const ADDTESS_TYPE_TO_ROUTE: { [id: string]: string } = {
    [ED25519_ADDRESS_TYPE]: "addr",
    [ALIAS_ADDRESS_TYPE]: "alias",
    [NFT_ADDRESS_TYPE]: "nft"
};

enum ADDRESS_PAGE_TABS {
    Transactions = "Transactions",
    NativeTokens = "Native Tokens",
    Nfts = "NFTs",
    AssocOutputs = "Associated Outputs"
}
enum NFT_PAGE_TABS {
    NftMetadata = "Metadata",
    Features = "Features"
}

const TX_HISTORY_JOB = "tx-history";
const ASSOC_OUTPUTS_JOB = "assoc-outputs";

const AddressPage: React.FC<RouteComponentProps<AddressRouteProps>> = (
    { location, match: { params: { network, address } } }
) => {
    const isMounted = useIsMounted();
    const [redirect, setRedirect] = useState<string | undefined>();
    const { name, bech32Hrp, rentStructure } = useContext(NetworkContext);
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [jobToStatus, setJobToStatus] = useState(
        new Map<string, PromiseStatus>()
            .set(TX_HISTORY_JOB, PromiseStatus.PENDING)
            .set(ASSOC_OUTPUTS_JOB, PromiseStatus.PENDING)
    );
    const [bech32AddressDetails, setBech32AddressDetails] = useState<IBech32AddressDetails | undefined>();
    const [balance, setBalance] = useState<number | undefined>();
    const [sigLockedBalance, setSigLockedBalance] = useState<number | undefined>();
    const [storageRentBalance, setStorageRentBalance] = useState<number | undefined>();
    const [addressOutputs, setAddressOutputs] = useState<IOutputResponse[] | undefined>();
    const [addressBasicOutputs, isBasicOutputsLoading] = useAddressBasicOutputs(network, bech32AddressDetails?.bech32);
    const [addressAliasOutputs, isAliasOutputsLoading] = useAddressAliasOutputs(network, bech32AddressDetails?.bech32);
    const [addressNftOutputs, isNftOutputsLoading] = useAddressNftOutputs(network, bech32AddressDetails?.bech32);
    const [nftOutput, nftMetadata, isNftDetailsLoading] = useNftDetails(network, bech32AddressDetails?.hex);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [transactionsCount, setTransactionsCount] = useState<number>(0);
    const [tokensCount, setTokenCount] = useState<number>(0);
    const [nftCount, setNftCount] = useState<number>(0);
    const [associatedOutputCount, setAssociatedOutputCount] = useState<number>(0);

    useEffect(() => {
        if (!location.state || Object.keys(location.state).length === 0) {
            location.state = {
                addressDetails: Bech32AddressHelper.buildAddress(bech32Hrp, address)
            };
        }

        const { addressDetails } = location.state as IAddressPageLocationProps;

        if (addressDetails?.hex) {
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: "smooth"
            });

            if (isMounted) {
                const addressType = addressDetails.type;
                const currentRoute = location.pathname.split("/")[2];
                const redirectRoute = ADDTESS_TYPE_TO_ROUTE[addressType ?? 0];
                if (currentRoute !== redirectRoute) {
                    setRedirect(`/${name}/${redirectRoute}/${addressDetails.bech32}`);
                } else {
                    setBech32AddressDetails(addressDetails);
                }
            }
        }
    }, []);

    useEffect(() => {
        if (bech32AddressDetails) {
            // eslint-disable-next-line no-void
            void getAddressBalance();
        }
    }, [bech32AddressDetails]);

    useEffect(() => {
        const loading = Array.from(jobToStatus.values()).some(status => status !== PromiseStatus.DONE);
        setIsLoading(loading);
    }, [jobToStatus.values()]);

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
                    setSigLockedBalance(response.sigLockedBalance);
                }
            } else {
                // Fallback balance from iotajs (node)
                const addressDetailsWithBalance = await tangleCacheService.addressBalance(
                    { network, address: addr }
                );

                if (addressDetailsWithBalance && isMounted) {
                    setBalance(Number(addressDetailsWithBalance.balance));
                }
            }
        });
    }

    /**
     * Helper function to build a asyncJobHandler.
     * @param jobName The job name.
     * @returns Function than can be used to update job PromiseStatus.
     */
    function buildOnAsyncStatusJobHandler(jobName: string): (status: PromiseStatus) => void {
        return (status: PromiseStatus) => {
            if (isMounted) {
                setJobToStatus(jobToStatus.set(jobName, status));
            }
        };
    }

    const addressBech32 = bech32AddressDetails?.bech32 ?? undefined;
    const addressType = bech32AddressDetails?.type ?? undefined;
    const isAddressOutputsLoading = isBasicOutputsLoading || isAliasOutputsLoading || isNftOutputsLoading;

    /**
     * Tab header options.
     */
    const addressTabOptions = {
        [ADDRESS_PAGE_TABS.Transactions]: {
            disabled: transactionsCount === 0,
            isLoading: jobToStatus.get(TX_HISTORY_JOB) !== PromiseStatus.DONE
        },
        [ADDRESS_PAGE_TABS.NativeTokens]: {
            disabled: tokensCount === 0,
            counter: tokensCount,
            isLoading: isAddressOutputsLoading
        },
        [ADDRESS_PAGE_TABS.Nfts]: {
            disabled: nftCount === 0,
            counter: nftCount,
            isLoading: isNftOutputsLoading
        },
        [ADDRESS_PAGE_TABS.AssocOutputs]: {
            disabled: associatedOutputCount === 0,
            counter: associatedOutputCount,
            isLoading: jobToStatus.get(ASSOC_OUTPUTS_JOB) !== PromiseStatus.DONE
        }
    };

    const nftTabOptions = {
        [NFT_PAGE_TABS.NftMetadata]: {
            disabled: !nftMetadata,
            isLoading: isNftDetailsLoading
        },
        [NFT_PAGE_TABS.Features]: {
            disabled: !nftOutput?.features && !nftOutput?.immutableFeatures,
            isLoading: isNftDetailsLoading
        }
    };

    const tabOptions = addressType === NFT_ADDRESS_TYPE ?
        { ...nftTabOptions, ...addressTabOptions } :
        addressTabOptions;
    /**
     * Tab sections.
     */
    const addressSections = [
        <TransactionHistory
            key={1}
            network={network}
            address={addressBech32}
            onAsyncStatusChange={buildOnAsyncStatusJobHandler(TX_HISTORY_JOB)}
            setTransactionCount={setTransactionsCount}
        />,
        <AssetsTable
            key={2}
            networkId={network}
            outputs={addressOutputs?.map(output => output.output)}
            setTokenCount={setTokenCount}
        />,
        <NftSection
            key={3}
            network={network}
            bech32Address={addressBech32}
            outputs={addressNftOutputs}
            setNftCount={setNftCount}
        />,
        <AssociatedOutputs
            key={4}
            network={network}
            addressDetails={bech32AddressDetails ?? {} as IBech32AddressDetails}
            onAsyncStatusChange={buildOnAsyncStatusJobHandler(ASSOC_OUTPUTS_JOB)}
            setOutputCount={setAssociatedOutputCount}
        />
    ];
    const nftSections = [
        <NftMetadataSection
            key={5}
            metadata={nftMetadata}
        />,
        <FeaturesSection
            key={6}
            output={nftOutput}
        />
    ];
    const tabbedSections = addressType === NFT_ADDRESS_TYPE ?
        [...nftSections, ...addressSections] :
        addressSections;

    return (
        redirect ? (
            <Redirect to={redirect} />
        ) : (
            <div className="address-page">
                <div className="wrapper">
                    {bech32AddressDetails && (
                        <div className="inner">
                            <div className="addr--header">
                                <div className="row middle">
                                    <h1>
                                        {bech32AddressDetails.typeLabel?.replace("Ed25519", "")} Address
                                    </h1>
                                    <Modal icon="info" data={mainHeaderInfo} />
                                </div>
                                {isLoading && <Spinner />}
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
                                        {balance !== undefined && (
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
                                tabsEnum={
                                    bech32AddressDetails.type === NFT_ADDRESS_TYPE ?
                                        { ...NFT_PAGE_TABS, ...ADDRESS_PAGE_TABS } :
                                        ADDRESS_PAGE_TABS
                                }
                                tabOptions={tabOptions}
                            >
                                {tabbedSections}
                            </TabbedSection>
                        </div>
                    )}
                </div>
            </div>
        )
    );
};

export default AddressPage;

