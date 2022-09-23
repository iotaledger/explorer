/* eslint-disable no-void */
import { IOutputResponse } from "@iota/iota.js-stardust";
import { optional } from "@ruffy/ts-optional/dist/Optional";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { AsyncState } from "../../../helpers/promise/AsyncState";
import PromiseMonitor, { PromiseStatus } from "../../../helpers/promise/promiseMonitor";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { TransactionsHelper } from "../../../helpers/stardust/transactionsHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { IBech32AddressDetails } from "../../../models/api/IBech32AddressDetails";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import QR from "../../components/chrysalis/QR";
import CopyButton from "../../components/CopyButton";
import Spinner from "../../components/Spinner";
import AddressBalance from "../../components/stardust/AddressBalance";
import AssetsTable from "../../components/stardust/AssetsTable";
import AssociatedOutputsTable from "../../components/stardust/AssociatedOutputsTable";
import Bech32Address from "../../components/stardust/Bech32Address";
import TransactionHistory from "../../components/stardust/history/TransactionHistory";
import NetworkContext from "../../context/NetworkContext";
import { AddressRouteProps } from "../AddressRouteProps";
import mainHeaderMessage from "./../../../assets/modals/stardust/address/main-header.json";
import Modal from "./../../components/Modal";
import { AddressPageState } from "./AddressPageState";
import NftSection from "./NftSection";
import "./AddressPage.scss";

interface IAddressPageLocationProps {
    /**
     * address details from location props
     */
    addressDetails: IBech32AddressDetails;
}

type State = AddressPageState & AsyncState;

/**
 * Component which will show the address page for stardust.
 */
class AddressPage extends AsyncComponent<RouteComponentProps<AddressRouteProps>, State> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * The component context.
     */
    public declare context: React.ContextType<typeof NetworkContext>;

    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: StardustTangleCacheService;

    /**
     * Create a new instance of AddressPage.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<AddressRouteProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);

        this.state = {
            jobToStatus: new Map<string, PromiseStatus>(),
            isFormatStorageRentFull: true
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
        const { bech32Hrp } = this.context;

        if (!this.props.location.state) {
            this.props.location.state = {
                addressDetails: Bech32AddressHelper.buildAddress(bech32Hrp, this.props.match.params.address)
            };
        }

        if (!(this.props.location.state as IAddressPageLocationProps)?.addressDetails) {
            this.props.history.replace(`/${this.props.match.params.network}/search/${this.props.match.params.address}`);
        }

        const { addressDetails } = this.props.location.state as IAddressPageLocationProps;

        if (addressDetails?.hex) {
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: "smooth"
            });

            this.setState({
                bech32AddressDetails: addressDetails
            }, async () => {
                void this.getAddressBalance();
                void this.getAddressOutputs();
            });
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const {
            bech32AddressDetails, balance, sigLockedBalance,
            outputResponse, jobToStatus, storageRentBalance, isFormatStorageRentFull
        } = this.state;
        const { tokenInfo } = this.context;

        const networkId = this.props.match.params.network;
        const addressBech32 = bech32AddressDetails?.bech32 ?? undefined;
        const isLoading = Array.from(jobToStatus.values()).some(status => status !== PromiseStatus.DONE);

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
                                    <Modal icon="info" data={mainHeaderMessage} />
                                </div>
                                {isLoading && <Spinner />}
                            </div>
                            <div className="top">
                                <div className="sections">
                                    <div className="section">
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
                                        {storageRentBalance ?
                                            <div className="section--data margin-t-m">
                                                <div className="label">
                                                    Storage rent
                                                </div>
                                                <div className="row middle value featured">
                                                    <span
                                                        onClick={() => {
                                                            this.setState({
                                                                isFormatStorageRentFull: !isFormatStorageRentFull
                                                            });
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
                                            </div> : ""}
                                    </div>
                                    {outputResponse && outputResponse.length === 0 && (
                                        <div className="section">
                                            <div className="section--data">
                                                <p>
                                                    There are no transactions for this address.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <AssetsTable
                                        networkId={networkId}
                                        outputs={outputResponse?.map(output => output.output)}
                                    />
                                    <NftSection
                                        network={networkId}
                                        bech32Address={addressBech32}
                                        outputs={outputResponse}
                                    />
                                    {addressBech32 && (
                                        <TransactionHistory
                                            network={networkId}
                                            address={addressBech32}
                                            onAsyncStatusChange={this.buildOnAsyncStatusJobHandler("history")}
                                        />
                                    )}
                                    {bech32AddressDetails && (
                                        <AssociatedOutputsTable
                                            network={networkId}
                                            addressDetails={bech32AddressDetails}
                                            onAsyncStatusChange={this.buildOnAsyncStatusJobHandler("assoc")}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    private async getAddressBalance() {
        const { name: network } = this.context;
        const { bech32AddressDetails } = this.state;

        optional(bech32AddressDetails?.bech32).foreach(async address => {
            const response = await this._tangleCacheService.addressBalanceFromChronicle({
                network,
                address
            });

            if (response?.totalBalance !== undefined) {
                this.setState({
                    balance: response.totalBalance,
                    sigLockedBalance: response.sigLockedBalance
                });
            } else {
                // Fallback balance from iotajs (node)
                const addressDetailsWithBalance = await this._tangleCacheService.addressBalance(
                    { network, address }
                );

                if (addressDetailsWithBalance) {
                    this.setState({
                        balance: Number(addressDetailsWithBalance.balance)
                    });
                }
            }
        });
    }

    /**
     * Fetch the address relevant outputs (basic, alias and nft)
     */
    private async getAddressOutputs(): Promise<void> {
        const networkId = this.props.match.params.network;
        const { rentStructure } = this.context;
        const addressBech32 = this.state.bech32AddressDetails?.bech32;
        if (!addressBech32) {
            return;
        }

        const outputIdsMonitor = new PromiseMonitor((status: PromiseStatus) => {
            this.buildOnAsyncStatusJobHandler("outputIds")(status);
        });

        void outputIdsMonitor.enqueue(
            async () => this._tangleCacheService.addressOutputs(networkId, addressBech32).then(idsResponse => {
                if (idsResponse?.outputIds) {
                    const outputResponse: IOutputResponse[] = [];
                    const addressOutputIds = idsResponse.outputIds;
                    let storageRentBalance: number | undefined;

                    const outputDetailsMonitor = new PromiseMonitor((status: PromiseStatus) => {
                        this.buildOnAsyncStatusJobHandler("outputDetails")(status);
                        if (status === PromiseStatus.DONE && this._isMounted) {
                            storageRentBalance = TransactionsHelper.computeStorageRentBalance(
                                outputResponse.map(or => or.output),
                                rentStructure
                            );
                            this.setState({ outputResponse, storageRentBalance });
                        }
                    });

                    for (const outputId of addressOutputIds) {
                        void outputDetailsMonitor.enqueue(
                            async () => this._tangleCacheService.outputDetails(networkId, outputId).then(
                                outputDetails => {
                                    if (outputDetails) {
                                        outputResponse.push(outputDetails);
                                    }
                                })
                        );
                    }
                }
            })
        );
    }

    private buildOnAsyncStatusJobHandler(jobName: string): (status: PromiseStatus) => void {
        return (status: PromiseStatus) => {
            this.setState(prevState => ({ ...prevState, jobToStatus: prevState.jobToStatus.set(jobName, status) }));
        };
    }
}

export default AddressPage;

