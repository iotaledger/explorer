import { IOutputResponse } from "@iota/iota.js-stardust";
import { optional } from "@ruffy/ts-optional/dist/Optional";
import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { useIsMounted } from "../../../helpers/hooks/useIsMounted";
import PromiseMonitor, { PromiseStatus } from "../../../helpers/promise/promiseMonitor";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { TransactionsHelper } from "../../../helpers/stardust/transactionsHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { IBech32AddressDetails } from "../../../models/api/IBech32AddressDetails";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import QR from "../../components/chrysalis/QR";
import CopyButton from "../../components/CopyButton";
import TabbedSection from "../../components/hoc/TabbedSection";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import AddressBalance from "../../components/stardust/AddressBalance";
import AssetsTable from "../../components/stardust/AssetsTable";
import AssociatedOutputs from "../../components/stardust/AssociatedOutputs";
import Bech32Address from "../../components/stardust/Bech32Address";
import TransactionHistory from "../../components/stardust/history/TransactionHistory";
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

enum ADDRESS_PAGE_TABS {
    Transactions = "Transactions",
    NativeTokens = "Native Tokens",
    Nfts = "NFTs",
    AssocOutputs = "Associated Outputs"
}

const TX_HISTORY_JOB = "tx-history";
const ADDR_OUTPUTS_JOB = "addr-outputs";
const ASSOC_OUTPUTS_JOB = "assoc-outputs";

const AddressPage: React.FC<RouteComponentProps<AddressRouteProps>> = (
    { location, match: { params: { network, address } } }
) => {
    const isMounted = useIsMounted();
    const { tokenInfo, bech32Hrp, rentStructure } = useContext(NetworkContext);
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [jobToStatus, setJobToStatus] = useState(new Map<string, PromiseStatus>());
    const [bech32AddressDetails, setBech32AddressDetails] = useState<IBech32AddressDetails | undefined>();
    const [balance, setBalance] = useState<number | undefined>();
    const [sigLockedBalance, setSigLockedBalance] = useState<number | undefined>();
    const [storageRentBalance, setStorageRentBalance] = useState<number | undefined>();
    const [outputResponse, setOutputResponse] = useState<IOutputResponse[] | undefined>();
    const [isFormatStorageRentFull, setIsFormatStorageRentFull] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [tokensCount, setTokenCount] = useState<number>(0);
    const [nftCount, setNftCount] = useState<number>(0);
    const [associatedOutputCount, setAssociatedOutputCount] = useState<number>(0);

    useEffect(() => {
        if (!location.state) {
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

            if (isMounted.current) {
                setBech32AddressDetails(addressDetails);
            }
        }
    }, [isMounted]);

    useEffect(() => {
        if (bech32AddressDetails) {
            // eslint-disable-next-line no-void
            void loadAddressData();
        }
    }, [bech32AddressDetails]);

    useEffect(() => {
        const loading = Array.from(jobToStatus.values()).some(status => status !== PromiseStatus.DONE);
        setIsLoading(loading);
    }, [jobToStatus.values()]);

    /**
     * Load the Address balance and UTXOs.
     */
    async function loadAddressData() {
        // eslint-disable-next-line no-void
        void getAddressBalance();
        // eslint-disable-next-line no-void
        void getAddressOutputs();
    }

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
                if (isMounted.current) {
                    setBalance(response.totalBalance);
                    setSigLockedBalance(response.sigLockedBalance);
                }
            } else {
                // Fallback balance from iotajs (node)
                const addressDetailsWithBalance = await tangleCacheService.addressBalance(
                    { network, address: addr }
                );

                if (addressDetailsWithBalance && isMounted.current) {
                    setBalance(Number(addressDetailsWithBalance.balance));
                }
            }
        });
    }

    /**
     * Fetch the address relevant outputs (basic, alias and nft)
     */
    async function getAddressOutputs(): Promise<void> {
        const addressBech32 = bech32AddressDetails?.bech32;
        if (!addressBech32) {
            return;
        }

        const outputIdsMonitor = new PromiseMonitor((status: PromiseStatus) => {
            buildOnAsyncStatusJobHandler(ADDR_OUTPUTS_JOB)(status);
        });

        // eslint-disable-next-line no-void
        void outputIdsMonitor.enqueue(
            async () => tangleCacheService.addressOutputs(network, addressBech32).then(idsResponse => {
                if (idsResponse?.outputIds && idsResponse.outputIds.length > 0) {
                    const outputResponsesUpdate: IOutputResponse[] = [];
                    const addressOutputIds = idsResponse.outputIds;
                    let storageRentBalanceUpdate: number | undefined;

                    const outputDetailsMonitor = new PromiseMonitor((status: PromiseStatus) => {
                        buildOnAsyncStatusJobHandler("outputDetails")(status);
                        if (status === PromiseStatus.DONE && isMounted.current) {
                            storageRentBalanceUpdate = TransactionsHelper.computeStorageRentBalance(
                                outputResponsesUpdate.map(or => or.output),
                                rentStructure
                            );
                            if (isMounted.current) {
                                setOutputResponse(outputResponsesUpdate);
                                setStorageRentBalance(storageRentBalanceUpdate);
                            }
                        }
                    });

                    for (const outputId of addressOutputIds) {
                        // eslint-disable-next-line no-void
                        void outputDetailsMonitor.enqueue(
                            async () => tangleCacheService.outputDetails(network, outputId).then(
                                response => {
                                    if (!response.error && response.output && response.metadata) {
                                        const outputDetails = {
                                            output: response.output,
                                            metadata: response.metadata
                                        };

                                        outputResponsesUpdate.push(outputDetails);
                                    }
                                })
                        );
                    }
                } else {
                    setOutputResponse([]);
                }
            })
        );
    }

    /**
     * Helper function to build a asyncJobHandler.
     * @param jobName The job name.
     * @returns Function than can be used to update job PromiseStatus.
     */
    function buildOnAsyncStatusJobHandler(jobName: string): (status: PromiseStatus) => void {
        return (status: PromiseStatus) => {
            if (isMounted.current) {
                setJobToStatus(jobToStatus.set(jobName, status));
            }
        };
    }

    const addressBech32 = bech32AddressDetails?.bech32 ?? undefined;

    return (
        <div className="address-page">
            <div className="wrapper">
                {bech32AddressDetails && (
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>
                                    Address
                                </h1>
                                <Modal icon="info" data={mainHeaderInfo} />
                            </div>
                            {isLoading && <Spinner />}
                        </div>
                        <div className="top">
                            <div className="sections">
                                <div className="section no-border-bottom">
                                    <div className="section--header">
                                        <div className="row middle">
                                            <h2>
                                                General
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="row space-between general-content">
                                        <div className="section--data">
                                            <Bech32Address
                                                addressDetails={bech32AddressDetails}
                                                advancedMode={true}
                                                showCopyButton={true}
                                            />
                                            {balance !== undefined && (
                                                <AddressBalance
                                                    balance={balance}
                                                    spendableBalance={sigLockedBalance}
                                                />
                                            )}
                                        </div>
                                        <div className="section--data">
                                            {bech32AddressDetails?.bech32 && (
                                                //  eslint-disable-next-line react/jsx-pascal-case
                                                <QR data={bech32AddressDetails.bech32} />
                                            )}
                                        </div>
                                    </div>
                                    {storageRentBalance && (
                                        <div className="section--data margin-t-m">
                                            <div className="label">
                                                Storage deposit
                                            </div>
                                            <div className="row middle value featured">
                                                <span
                                                    onClick={() => {
                                                        if (isMounted.current) {
                                                            setIsFormatStorageRentFull(!isFormatStorageRentFull);
                                                        }
                                                    }}
                                                    className="pointer margin-r-5"
                                                >
                                                    {formatAmount(
                                                        storageRentBalance,
                                                        tokenInfo,
                                                        isFormatStorageRentFull
                                                    )}
                                                </span>
                                                <CopyButton copy={String(storageRentBalance)} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <TabbedSection
                                    tabsEnum={ADDRESS_PAGE_TABS}
                                    tabOptions={{
                                        [ADDRESS_PAGE_TABS.Transactions]: {
                                            disabled: jobToStatus.get(TX_HISTORY_JOB) !== PromiseStatus.DONE,
                                            isLoading: jobToStatus.get(TX_HISTORY_JOB) !== PromiseStatus.DONE
                                        },
                                        [ADDRESS_PAGE_TABS.NativeTokens]: {
                                            disabled: tokensCount === 0,
                                            counter: tokensCount,
                                            isLoading: jobToStatus.get(ADDR_OUTPUTS_JOB) !== PromiseStatus.DONE
                                        },
                                        [ADDRESS_PAGE_TABS.Nfts]: {
                                            disabled: nftCount === 0,
                                            counter: nftCount,
                                            isLoading: jobToStatus.get(ADDR_OUTPUTS_JOB) !== PromiseStatus.DONE
                                        },
                                        [ADDRESS_PAGE_TABS.AssocOutputs]: {
                                            disabled: associatedOutputCount === 0,
                                            counter: associatedOutputCount,
                                            isLoading: jobToStatus.get(ASSOC_OUTPUTS_JOB) !== PromiseStatus.DONE
                                        }
                                    }}
                                >
                                    <TransactionHistory
                                        network={network}
                                        address={addressBech32}
                                        onAsyncStatusChange={buildOnAsyncStatusJobHandler(TX_HISTORY_JOB)}
                                    />
                                    <AssetsTable
                                        networkId={network}
                                        outputs={outputResponse?.map(output => output.output)}
                                        setTokenCount={setTokenCount}
                                    />
                                    <NftSection
                                        network={network}
                                        bech32Address={addressBech32}
                                        outputs={outputResponse}
                                        setNftCount={setNftCount}
                                    />
                                    <AssociatedOutputs
                                        network={network}
                                        addressDetails={bech32AddressDetails}
                                        onAsyncStatusChange={buildOnAsyncStatusJobHandler(ASSOC_OUTPUTS_JOB)}
                                        setOutputCount={setAssociatedOutputCount}
                                    />
                                </TabbedSection>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddressPage;

