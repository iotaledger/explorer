import { IOutputResponse } from "@iota/iota.js-stardust";
import { optional } from "@ruffy/ts-optional/dist/Optional";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { PromiseResolver, ResolverStatus } from "../../../helpers/promiseResolver";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import IAddressDetailsWithBalance from "../../../models/api/stardust/IAddressDetailsWithBalance";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import QR from "../../components/chrysalis/QR";
import Spinner from "../../components/Spinner";
import AddressBalance from "../../components/stardust/AddressBalance";
import AssetsTable from "../../components/stardust/AssetsTable";
import AssociatedOutputsTable from "../../components/stardust/AssociatedOutputsTable";
import Bech32Address from "../../components/stardust/Bech32Address";
import TransactionHistory from "../../components/stardust/history/TransactionHistory";
import NetworkContext from "../../context/NetworkContext";
import { AddressRouteProps } from "../AddressRouteProps";
import mainHeaderMessage from "./../../../assets/modals/address/main-header.json";
import Modal from "./../../components/Modal";
import "./AddressPage.scss";
import { AddressPageState } from "./AddressPageState";
import NftSection from "./NftSection";
import { PromiseResolverState } from "./PromiseResolverState";

interface IAddressPageLocationProps {
    /**
     * address details from location props
     */
    addressDetails: IAddressDetailsWithBalance;
    /**
     * address unspent output ids
     */
    addressOutputIds: string[];
}

type State = AddressPageState & PromiseResolverState;

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
            asyncStatuses: {}
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
        const { bech32Hrp, name: network } = this.context;

        if (!this.props.location.state) {
            const result = await this._tangleCacheService.search(
                this.props.match.params.network, this.props.match.params.address
            );

            this.props.location.state = {
                addressDetails: result?.addressDetails,
                addressOutputIds: result?.addressOutputIds
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
                bech32AddressDetails: Bech32AddressHelper.buildAddress(
                    bech32Hrp,
                    addressDetails?.hex,
                    addressDetails?.type ?? 0
                ),
                balance: Number(addressDetails?.balance)
            }, async () => {
                await this.getOutputs();
            });
        }

        // Try get balance from chronicle
        optional(addressDetails.bech32).foreach(async addressBech32 => {
            const response = await this._tangleCacheService.addressBalance({
                network,
                address: addressBech32
            });

            if (response?.totalBalance !== undefined) {
                this.setState({
                    balance: response.totalBalance,
                    sigLockedBalance: response.sigLockedBalance
                });
            }
        });
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { bech32AddressDetails, balance, sigLockedBalance, outputResponse, asyncStatuses } = this.state;

        const networkId = this.props.match.params.network;
        const addressBech32 = bech32AddressDetails?.bech32 ?? undefined;

        // Are async calls still in flight ?
        const isLoading = Object.values(asyncStatuses).some(status => status !== ResolverStatus.DONE);

        return (
            <div className="addr">
                <div className="wrapper">
                    {bech32AddressDetails ?
                        <div className="inner">
                            <div className="addr--header">
                                <div className="row middle">
                                    <h1>
                                        Address
                                    </h1>
                                    <Modal icon="info" data={mainHeaderMessage} />
                                </div>
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
                                                {bech32AddressDetails?.bech32 &&
                                                    (
                                                        //  eslint-disable-next-line react/jsx-pascal-case
                                                        <QR data={bech32AddressDetails.bech32} />
                                                    )}
                                            </div>
                                        </div>
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
                                        onAsyncStatus={status => {
                                            this.setState((previousState) => {
                                                return {
                                                    ...previousState,
                                                    asyncStatuses: {
                                                        ...previousState.asyncStatuses,
                                                        "nfts": status
                                                    }
                                                }
                                            })
                                        }}
                                    />
                                    {addressBech32 && (
                                        <TransactionHistory
                                            network={networkId}
                                            address={addressBech32}
                                            onAsyncStatus={status => {
                                                this.setState((previousState) => {
                                                    return {
                                                        ...previousState,
                                                        asyncStatuses: {
                                                            ...previousState.asyncStatuses,
                                                            "transactionHistory": status
                                                        }
                                                    }
                                                })
                                            }}
                                        />
                                    )}
                                    {bech32AddressDetails && (
                                        <AssociatedOutputsTable
                                            network={networkId}
                                            addressDetails={bech32AddressDetails}
                                            onAsyncStatus={status => {
                                                this.setState((previousState) => {
                                                    return {
                                                        ...previousState,
                                                        asyncStatuses: {
                                                            ...previousState.asyncStatuses,
                                                            "associatedOutputs": status
                                                        }
                                                    }
                                                })
                                            }}
                                        />
                                    )}
                                    {isLoading && (
                                        <div className="inner row middle center loader">
                                            <Spinner />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div > :
                        <div className="inner row middle center loader">
                            <Spinner />
                        </div>}
                </div >
            </div >
        );
    }

    private async getOutputs() {
        const { addressOutputIds } = this.props.location.state as IAddressPageLocationProps;
        if (!addressOutputIds || addressOutputIds.length === 0) {
            return;
        }

        const networkId = this.props.match.params.network;
        const outputResponse: IOutputResponse[] = [];

        const asyncResolver = new PromiseResolver((status: ResolverStatus) => {
            this.setState((previousState) => {
                return {
                    ...previousState,
                    asyncStatuses: {
                        ...previousState.asyncStatuses,
                        "assets": status
                    }
                }
            })
            if (status === ResolverStatus.DONE && this._isMounted) {
                this.setState({ outputResponse });
            }
        })
        for (const outputId of addressOutputIds) {
            const outputDetailsPromise = this._tangleCacheService.outputDetails(networkId, outputId).then(outputDetails => {
                if (outputDetails) {
                    outputResponse.push(outputDetails);
                }
            });
            asyncResolver.enqueue(async () => outputDetailsPromise);
        }
    }
}

export default AddressPage;

