import { IOutputResponse, TREASURY_OUTPUT_TYPE } from "@iota/iota.js-stardust";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { isMarketedNetwork } from "../../../helpers/networkHelper";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import IAddressDetailsWithBalance from "../../../models/api/stardust/IAddressDetailsWithBalance";
import { STARDUST } from "../../../models/config/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import QR from "../../components/chrysalis/QR";
import CopyButton from "../../components/CopyButton";
import FiatValue from "../../components/FiatValue";
import Icon from "../../components/Icon";
import AssetsTable from "../../components/stardust/AssetsTable";
import AssociatedOutputsTable from "../../components/stardust/AssociatedOutputsTable";
import Bech32Address from "../../components/stardust/Bech32Address";
import TransactionHistory from "../../components/stardust/history/TransactionHistory";
import NetworkContext from "../../context/NetworkContext";
import { AddressRouteProps } from "../AddressRouteProps";
import chevronRightGray from "./../../../assets/chevron-right-gray.svg";
import mainHeaderMessage from "./../../../assets/modals/address/main-header.json";
import Modal from "./../../components/Modal";
import "./AddressPage.scss";
import { AddressPageState } from "./AddressPageState";
import NftSection from "./NftSection";

interface IAddressPageLocationProps {
    addressDetails: IAddressDetailsWithBalance;
    addressOutputIds: string[];
}

/**
 * Component which will show the address page for stardust.
 */
class AddressPage extends AsyncComponent<RouteComponentProps<AddressRouteProps>, AddressPageState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: StardustTangleCacheService;

    /**
     * The hrp of bech addresses.
     */
    private readonly _bechHrp: string;

    /**
     * Create a new instance of AddressPage.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<AddressRouteProps>) {
        super(props);

        const networkService = ServiceFactory.get<NetworkService>("network");
        const networkConfig = this.props.match.params.network
            ? networkService.get(this.props.match.params.network)
            : undefined;

        this._tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);

        this._bechHrp = networkConfig?.bechHrp ?? "iota";

        this.state = {
            ...Bech32AddressHelper.buildAddress(this._bechHrp, props.match.params.address),
            formatFull: true
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

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
                    this._bechHrp,
                    addressDetails?.hex,
                    addressDetails?.type ?? 0
                ),
                balance: Number(addressDetails?.balance)
            }, async () => {
                await this.getOutputs();
            });
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { bech32AddressDetails, balance, outputResponse, formatFull, nftsCount } = this.state;

        const networkId = this.props.match.params.network;
        const isMarketed = isMarketedNetwork(networkId);
        const nativeTokensCount = outputResponse ? this.countDistinctNativeTokens(outputResponse) : 0;
        const hasNativeTokens = nativeTokensCount > 0;
        const hasNfts = Boolean(nftsCount);
        const addressBech32 = bech32AddressDetails?.bech32 ?? undefined;

        return (
            <div className="addr">
                <div className="wrapper">
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
                                            {balance != undefined && (
                                                <div className="row middle">
                                                    <Icon icon="wallet" boxed />
                                                    <div className="balance">
                                                        <div className="label">
                                                            Final balance
                                                        </div>
                                                        <div className="value featured">
                                                            {balance > 0 ? (
                                                                <div className="row middle">
                                                                    <span
                                                                        onClick={() => this.setState({
                                                                            formatFull: !formatFull
                                                                        })}
                                                                        className="pointer margin-r-5"
                                                                    >
                                                                        {formatAmount(
                                                                            balance,
                                                                            this.context.tokenInfo,
                                                                            formatFull
                                                                        )}
                                                                    </span>
                                                                    {isMarketed && (
                                                                        <React.Fragment>
                                                                            <span>(</span>
                                                                            <FiatValue value={balance} />
                                                                            <span>)</span>
                                                                        </React.Fragment>
                                                                    )}
                                                                    <CopyButton
                                                                        onClick={() => ClipboardHelper.copy(
                                                                            String(balance)
                                                                        )}
                                                                        buttonType="copy"
                                                                    />
                                                                </div>
                                                            ) : 0}
                                                        </div>
                                                    </div>
                                                </div>
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
                                    {(hasNativeTokens || hasNfts) && (
                                        <div className="asset-summary row">
                                            {hasNativeTokens && (
                                                <div className="section--assets">
                                                    <div className="inner--asset">
                                                        <div className="section--data assets">
                                                            <span className="label">
                                                                Assets in wallet ({nativeTokensCount})
                                                            </span>
                                                        </div>
                                                        <img
                                                            src={chevronRightGray}
                                                            alt="bundle"
                                                            className="svg-navigation"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {hasNfts && (
                                                <div className="section--NFT">
                                                    <div className="inner--asset">
                                                        <div className="section--data assets">
                                                            <span className="label">
                                                                NFTs in wallet ({nftsCount})
                                                            </span>
                                                        </div>
                                                        <img
                                                            src={chevronRightGray}
                                                            alt="bundle"
                                                            className="svg-navigation"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                                    onNftsLoaded={count => this.setNftsCount(count as number)}
                                />
                                {addressBech32 && (
                                    <TransactionHistory network={networkId} address={addressBech32} />
                                )}
                                {bech32AddressDetails && (
                                    <AssociatedOutputsTable network={networkId} addressDetails={bech32AddressDetails} />
                                )}
                            </div>
                        </div>
                    </div >
                </div >
            </div >
        );
    }

    private setNftsCount(nftsCount: number): void {
        if (nftsCount > 0) {
            this.setState({ nftsCount });
        }
    }

    private countDistinctNativeTokens(outputResponse: IOutputResponse[]): number {
        const distinctNativeTokens: string[] = [];
        for (const response of outputResponse) {
            if (response.output.type !== TREASURY_OUTPUT_TYPE && response.output.nativeTokens) {
                for (const nativeToken of response.output.nativeTokens) {
                    if (!distinctNativeTokens.includes(nativeToken.id)) {
                        distinctNativeTokens.push(nativeToken.id);
                    }
                }
            }
        }
        return distinctNativeTokens.length;
    }

    private async getOutputs() {
        const { addressOutputIds } = this.props.location.state as IAddressPageLocationProps;
        if (!addressOutputIds || addressOutputIds.length === 0) {
            return;
        }

        const networkId = this.props.match.params.network;
        const outputResponse: IOutputResponse[] = [];

        for (const outputId of addressOutputIds) {
            const outputDetails = await this._tangleCacheService.outputDetails(networkId, outputId);
            if (outputDetails) {
                outputResponse.push(outputDetails);
            }
        }

        this.setState({ outputResponse });
    }
}

export default AddressPage;

