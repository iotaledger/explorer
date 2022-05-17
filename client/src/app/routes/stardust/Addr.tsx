/* eslint-disable max-len */
/* eslint-disable camelcase */
import { Blake2b } from "@iota/crypto.js-stardust";
import { BASIC_OUTPUT_TYPE, IOutputResponse, NFT_OUTPUT_TYPE } from "@iota/iota.js-stardust";
import { Converter, HexHelper } from "@iota/util.js-stardust";
import bigInt from "big-integer";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { STARDUST } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import QR from "../../components/chrysalis/QR";
import FiatValue from "../../components/FiatValue";
import Icon from "../../components/Icon";
import { ModalIcon } from "../../components/ModalProps";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import Asset from "../../components/stardust/Asset";
import Bech32Address from "../../components/stardust/Bech32Address";
import Nft from "../../components/stardust/Nft";
import NetworkContext from "../../context/NetworkContext";
import { AddrRouteProps } from "../AddrRouteProps";
import chevronRightGray from "./../../../assets/chevron-right-gray.svg";
import messageJSON from "./../../../assets/modals/message.json";
import Modal from "./../../components/Modal";
import "./Addr.scss";
import { AddrState } from "./AddrState";
import INftDetails from "./INftDetails";
import ITokenDetails from "./ITokenDetails";

/**
 * Component which will show the address page for stardust.
 */
class Addr extends AsyncComponent<RouteComponentProps<AddrRouteProps>, AddrState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * Native Tokens page size.
     */
    private static readonly TOKENS_PAGE_SIZE: number = 10;

    /**
     * Nfts page size.
     */
    private static readonly NFTS_PAGE_SIZE: number = 10;

    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: StardustTangleCacheService;

    /**
     * The hrp of bech addresses.
     */
    private readonly _bechHrp: string;

    /**
     * Create a new instance of Addr.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<AddrRouteProps>) {
        super(props);

        const networkService = ServiceFactory.get<NetworkService>("network");
        const networkConfig = this.props.match.params.network
            ? networkService.get(this.props.match.params.network)
            : undefined;

        this._tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);

        this._bechHrp = networkConfig?.bechHrp ?? "iota";

        this.state = {
            ...Bech32AddressHelper.buildAddress(this._bechHrp, props.match.params.address),
            formatFull: false,
            areTokensLoading: true,
            areNftsLoading: true,
            tokens: [],
            tokensPageNumber: 1,
            tokensPage: [],
            nfts: [],
            nftsPageNumber: 1,
            nftsPage: []
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        const result = await this._tangleCacheService.search(
            this.props.match.params.network, this.props.match.params.address
        );

        if (result?.address) {
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: "smooth"
            });

            this.setState({
                bech32AddressDetails: Bech32AddressHelper.buildAddress(
                    this._bechHrp,
                    result.address,
                    result.addressDetails?.type ? result.addressDetails.type.type : 0
                ),
                balance: Number(result.addressDetails?.balance),
                outputIds: result.addressOutputIds
            }, async () => {
                await this.getOutputs();
                await this.getNativeTokens();
                await this.getNfts();
            });
        } else {
            this.props.history.replace(`/${this.props.match.params.network}/search/${this.props.match.params.address}`);
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const networkId = this.props.match.params.network;
        const hasNativeTokens = this.state.tokens && this.state.tokens.length > 0;
        const hasNfts = this.state.nfts && this.state.nfts.length > 0;

        return (
            <div className="addr">
                <div className="wrapper">
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>
                                    Address
                                </h1>
                                <Modal icon={ModalIcon.Info} data={messageJSON} />
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
                                                addressDetails={this.state.bech32AddressDetails}
                                                advancedMode={true}
                                            />
                                            {this.state.balance !== undefined && (
                                                <div className="row middle">
                                                    <Icon icon="wallet" boxed />
                                                    <div className="balance">
                                                        <div className="label">
                                                            Final balance
                                                        </div>
                                                        <div className="value featured">
                                                            {this.state.balance > 0 ? (
                                                                <React.Fragment>
                                                                    {
                                                                        formatAmount(
                                                                            this.state.balance,
                                                                            this.context.tokenInfo,
                                                                            this.state.formatFull
                                                                        )
                                                                    }
                                                                    {" "}
                                                                    <span>(</span>
                                                                    <FiatValue value={this.state.balance} />
                                                                    <span>)</span>
                                                                </React.Fragment>
                                                            ) : 0}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="section--data">
                                            {this.state.bech32AddressDetails?.bech32 &&
                                                (
                                                    //  eslint-disable-next-line react/jsx-pascal-case
                                                    <QR data={this.state.bech32AddressDetails.bech32} />
                                                )}
                                        </div>
                                    </div>
                                    {(hasNativeTokens || hasNfts) && (
                                        <div className="asset-cards row">
                                            {hasNativeTokens && (
                                                <div className="section--assets">
                                                    <div className="inner--asset">
                                                        <div className="section--data assets">
                                                            <span className="label">Assets in wallet ({this.state.tokens?.length})</span>
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
                                                            <span className="label">NFTs in wallet ({this.state.nfts?.length})</span>
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
                                {this.state.outputs && this.state.outputs.length === 0 && (
                                    <div className="section">
                                        <div className="section--data">
                                            <p>
                                                There are no transactions for this address.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {this.state.areTokensLoading && (
                                    <div className="section transaction--section">
                                        <div className="section--header row space-between">
                                            <div className="margin-t-s middle row">
                                                <Spinner />
                                                <p className="status">Loading Assets...</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {hasNativeTokens && (
                                    <div className="section transaction--section">
                                        <div className="section--header row space-between">
                                            <div className="row middle">
                                                <h2>
                                                    Assets in Wallet ({this.state.tokens?.length})
                                                </h2>
                                                <Modal icon={ModalIcon.Info} data={messageJSON} />
                                            </div>
                                        </div>
                                        <table className="transaction--table">
                                            <thead>
                                                <tr>
                                                    <th>Asset</th>
                                                    <th>Symbol</th>
                                                    <th>Quantity</th>
                                                    <th>Price</th>
                                                    <th>Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                { this.currentTokensPage?.map((token, k) => (
                                                    <React.Fragment key={`${token?.name}${k}`}>
                                                        <Asset
                                                            key={k}
                                                            name={token?.name}
                                                            network={networkId}
                                                            symbol={token?.symbol}
                                                            amount={token.amount}
                                                            price={token?.price}
                                                            value={token?.value}
                                                            tableFormat={true}
                                                        />
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Only visible in mobile -- Card assets*/}
                                        <div className="transaction-cards">
                                            {this.currentTokensPage?.map((token, k) => (
                                                <React.Fragment key={`${token?.name}${k}`}>
                                                    <Asset
                                                        key={k}
                                                        name={token?.name}
                                                        network={networkId}
                                                        symbol={token?.symbol}
                                                        amount={token?.amount}
                                                        price={token?.price}
                                                        value={token?.value}
                                                    />
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        <Pagination
                                            currentPage={this.state.tokensPageNumber}
                                            totalCount={this.state.tokens?.length ?? 0}
                                            pageSize={Addr.TOKENS_PAGE_SIZE}
                                            siblingsCount={1}
                                            onPageChange={page => this.setState({ tokensPageNumber: page })}
                                        />
                                    </div>
                                )}
                                {this.state.areNftsLoading && (
                                    <div className="section transaction--section no-border">
                                        <div className="section--header row space-between">
                                            <div className="margin-t-s middle row">
                                                <Spinner />
                                                <p className="status">Loading NFTs...</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {hasNfts && (
                                    <div className="section transaction--section no-border">
                                        <div className="section--header row space-between">
                                            <div className="row middle">
                                                <h2>
                                                    NFTs in Wallet ({this.state.nfts?.length})
                                                </h2>
                                                <Modal icon={ModalIcon.Info} data={messageJSON} />
                                            </div>
                                        </div>
                                        <div className="nft--section">
                                            { this.currentNftsPage?.map((nft, k) => (
                                                <React.Fragment key={`${nft.id}${k}`}>
                                                    <Nft
                                                        key={k}
                                                        id={nft.id}
                                                        name={nft.name}
                                                        network={networkId}
                                                        image={nft.image}
                                                    />
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        <Pagination
                                            currentPage={this.state.nftsPageNumber}
                                            totalCount={this.state.nfts?.length ?? 0}
                                            pageSize={Addr.NFTS_PAGE_SIZE}
                                            siblingsCount={1}
                                            onPageChange={page => this.setState({ nftsPageNumber: page })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div >
                </div >
            </div >
        );
    }

    private get currentTokensPage() {
        const from = (this.state.tokensPageNumber - 1) * Addr.TOKENS_PAGE_SIZE;
        const to = from + Addr.TOKENS_PAGE_SIZE;

        return this.state.tokens?.slice(from, to);
    }

    private get currentNftsPage() {
        const from = (this.state.nftsPageNumber - 1) * Addr.NFTS_PAGE_SIZE;
        const to = from + Addr.NFTS_PAGE_SIZE;

        return this.state.nfts?.slice(from, to);
    }

    private async getOutputs() {
        if (!this.state.outputIds || this.state.outputIds?.length === 0) {
            return;
        }
        const networkId = this.props.match.params.network;
        const outputs: IOutputResponse[] = [];

        for (const outputId of this.state.outputIds) {
            const outputDetails = await this._tangleCacheService.outputDetails(networkId, outputId);
            if (outputDetails) {
                outputs.push(outputDetails);
            }
        }

        this.setState({ outputs });
    }

    private async getNativeTokens() {
        if (!this.state.outputs || this.state.outputs?.length === 0) {
            this.setState({ areTokensLoading: false });
            return;
        }
        const tokens: ITokenDetails[] = [];

        for (const output of this.state.outputs) {
            if (!output.isSpent && output.output.type === BASIC_OUTPUT_TYPE && output.output.nativeTokens.length > 0) {
                const basicOutput = output.output;
                for (const token of basicOutput.nativeTokens) {
                    tokens.push({
                        name: token.id,
                        amount: Number.parseInt(token.amount, 16)
                    });
                }
            }
        }

        this.setState({
            tokens,
            areTokensLoading: false
        });
    }

    private async getNfts() {
        if (!this.state.bech32AddressDetails?.bech32) {
            this.setState({ areNftsLoading: false });
            return;
        }
        const networkId = this.props.match.params.network;

        const nfts: INftDetails[] = [];

        const nftOutputs = await this._tangleCacheService.nfts({
            network: networkId,
            address: this.state.bech32AddressDetails?.bech32
        });

        if (nftOutputs?.outputs && nftOutputs?.outputs?.items.length > 0) {
            for (const outputId of nftOutputs.outputs.items) {
                const output = await this._tangleCacheService.outputDetails(networkId, outputId);
                if (output && !output.isSpent && output.output.type === NFT_OUTPUT_TYPE) {
                    const nftOutput = output.output;
                    const nftId = !HexHelper.toBigInt256(nftOutput.nftId).eq(bigInt.zero)
                        ? nftOutput.nftId
                        // NFT has Id 0 because it hasn't move, but we can compute it as a hash of the outputId
                        : HexHelper.addPrefix(Converter.bytesToHex(
                            Blake2b.sum160(Converter.hexToBytes(HexHelper.stripPrefix(outputId)))
                        ));

                    nfts.push({
                        id: nftId,
                        image: "https://cdn.pixabay.com/photo/2021/11/06/14/40/nft-6773494_960_720.png"
                    });
                }
            }
        }

        this.setState({
            nfts,
            areNftsLoading: false
        });
    }
}

export default Addr;

