/* eslint-disable max-len */
/* eslint-disable camelcase */
import { TRANSACTION_PAYLOAD_TYPE, UnitsHelper } from "@iota/iota.js";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { Bech32AddressHelper } from "../../../helpers/bech32AddressHelper";
import { TransactionsHelper } from "../../../helpers/chrysalis/transactionsHelper";
import { CHRYSALIS } from "../../../models/db/protocolVersion";
import { ChrysalisTangleCacheService } from "../../../services/chrysalis/chrysalisTangleCacheService";
import { NetworkService } from "../../../services/networkService";
import AsyncComponent from "../../components/AsyncComponent";
import Bech32Address from "../../components/chrysalis/Bech32Address";
import QR from "../../components/chrysalis/QR";
import FiatValue from "../../components/FiatValue";
import Icon from "../../components/Icon";
import { ModalIcon } from "../../components/ModalProps";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import { AddrRouteProps } from "../AddrRouteProps";
import messageJSON from "./../../../assets/modals/message.json";
import Transaction from "./../../components/chrysalis/Transaction";
import Asset from "./../../components/chrysalis/Asset";
import NFT from "./../../components/chrysalis/NFT";
import Modal from "./../../components/Modal";
import "./Addr.scss";
import { AddrState } from "./AddrState";
import chevronRightGray from "./../../../assets/chevron-right-gray.svg";

/**
 * Component which will show the address page for chrysalis and older.
 */
class Addr extends AsyncComponent<RouteComponentProps<AddrRouteProps>, AddrState> {
    /**
     * Maximum page size for permanode request.
     */
     private static readonly MAX_PAGE_SIZE: number = 6000;

    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: ChrysalisTangleCacheService;

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

        this._tangleCacheService = ServiceFactory.get<ChrysalisTangleCacheService>(`tangle-cache-${CHRYSALIS}`);

        this._bechHrp = networkConfig?.bechHrp ?? "iot";

        this.state = {
            ...Bech32AddressHelper.buildAddress(
                this._bechHrp,
                props.match.params.address
            ),
            formatFull: false,
            statusBusy: true,
            status: "Loading transactions...",
            assetStatusBusy: true,
            assetStatus: "Loading Assets...",
            nftStatusBusy: true,
            nftStatus: "Loading NFTs...",
            received: 0,
            sent: 0,
            currentPage: 1,
            pageSize: 10,
            currentPageTransactions: [],
            assetCurrentPage: 1,
            assetPageSize: 10,
            currentPageAssets: [],
            nftCurrentPage: 1,
            nftPageSize: 10,
            currentPageNFTs: []
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
        const result = await this._tangleCacheService.search(
            this.props.match.params.network, this.props.match.params.address);
        if (result?.address) {
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: "smooth"
            });

            this.setState({
                address: result.address,
                bech32AddressDetails: Bech32AddressHelper.buildAddress(
                    this._bechHrp,
                    result.address.address,
                    result.address.addressType
                ),
                balance: result.address.balance,
                outputIds: result.addressOutputIds,
                historicOutputIds: result.historicAddressOutputIds
            }, async () => {
                await this.getTransactionHistory();
                await this.getAssetsHistory();
                await this.getNFTsHistory();
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
                                            {/* {!this.state.statusBusy && (
                                                <div className="row row--tablet-responsive">
                                                    <div className="section--data margin-r-m">
                                                        <div className="label">
                                                            Total received
                                                        </div>
                                                        <div className="value">
                                                            {UnitsHelper.formatBest(
                                                                (this.state.balance ?? 0) + this.state.sent
                                                            )}
                                                            {" "}(
                                                            <FiatValue
                                                                value={
                                                                    (this.state.balance ?? 0) +
                                                                    this.state.sent
                                                                }
                                                            />)
                                                        </div>
                                                    </div>
                                                    <div className="section--data">
                                                        <div className="label">
                                                            Total sent
                                                        </div>
                                                        <div className="value">
                                                            {this.state.statusBusy ? (<Spinner />)
                                                                : (
                                                                    <React.Fragment>
                                                                        {UnitsHelper.formatBest(this.state.sent)}
                                                                        {" "}(<FiatValue value={this.state.sent} />)
                                                                    </React.Fragment>
                                                                )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )} */}

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
                                                                    {UnitsHelper.formatBest(this.state.balance)}
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
                                    {this.props.match.params.network === 'stardust-testnet-4' && (
                                        <div className="asset-cards row">
                                            <div className="section--assets">
                                                <div className="inner--asset">
                                                    <div className="section--data assets">
                                                        <span className="label">Assets in wallet (12)</span>
                                                        <span className="value">{this.state.balance}</span>
                                                    </div>
                                                    <img
                                                        src={chevronRightGray}
                                                        alt="bundle"
                                                        className="svg-navigation"
                                                    />                
                                                </div>
                                            </div>
                                            <div className="section--NFT">
                                                <div className="inner--asset">
                                                    <div className="section--data assets">
                                                        <span className="label">NFTs in wallet (37)</span>
                                                        <span className="value">-</span>
                                                    </div>
                                                    <img
                                                        src={chevronRightGray}
                                                        alt="bundle"
                                                        className="svg-navigation"
                                                    />                
                                                </div>
                                            </div>
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

                                {this.txsHistory.length > 0 && (
                                    <div className="section transaction--section">
                                        <div className="section--header row space-between">
                                            <div className="row middle">
                                                <h2>
                                                    Transaction History
                                                </h2>
                                                <Modal icon={ModalIcon.Info} data={messageJSON} />
                                            </div>
                                            {this.state.status && (
                                                <div className="margin-t-s middle row">
                                                    {this.state.statusBusy && (<Spinner />)}
                                                    <p className="status">
                                                        {this.state.status}
                                                    </p>
                                                </div>
                                            )}

                                        </div>
                                        <table className="transaction--table">
                                            <thead>
                                                <tr>
                                                    <th>Message id</th>
                                                    <th>Date</th>
                                                    <th>Inputs</th>
                                                    <th>Outputs</th>
                                                    <th>Status</th>
                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                { this.currentPageTransactions.map((transaction, k) =>
                                                    (
                                                        <React.Fragment key={`${transaction?.messageId}${k}`}>
                                                            <Transaction
                                                                key={transaction?.messageId}
                                                                messageId={transaction?.messageId}
                                                                network={this.props.match.params.network}
                                                                inputs={transaction?.inputs.length}
                                                                outputs={transaction?.outputs.length}
                                                                messageTangleStatus={transaction?.messageTangleStatus}
                                                                date={transaction?.date}
                                                                amount={transaction?.amount}
                                                                tableFormat={true}
                                                                hasConflicts={!transaction.ledgerInclusionState || transaction.ledgerInclusionState === "conflicting"}
                                                            />
                                                            {transaction?.relatedSpentTransaction && (
                                                                <Transaction
                                                                    key={transaction?.relatedSpentTransaction.messageId}
                                                                    messageId={transaction?.relatedSpentTransaction.messageId}
                                                                    network={this.props.match.params.network}
                                                                    inputs={transaction?.relatedSpentTransaction.inputs.length}
                                                                    outputs={transaction?.relatedSpentTransaction.outputs.length}
                                                                    messageTangleStatus={transaction?.relatedSpentTransaction.messageTangleStatus}
                                                                    date={transaction?.relatedSpentTransaction.date}
                                                                    amount={transaction?.relatedSpentTransaction.amount}
                                                                    tableFormat={true}
                                                                />
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                            </tbody>
                                        </table>

                                        {/* Only visible in mobile -- Card transactions*/}
                                        <div className="transaction-cards">
                                            {this.currentPageTransactions.map((transaction, k) =>
                                                (
                                                    <React.Fragment key={`${transaction?.messageId}${k}`}>
                                                        <Transaction
                                                            key={transaction?.messageId}
                                                            messageId={transaction?.messageId}
                                                            network={this.props.match.params.network}
                                                            inputs={transaction?.inputs.length}
                                                            outputs={transaction?.outputs.length}
                                                            messageTangleStatus={transaction?.messageTangleStatus}
                                                            date={transaction?.date}
                                                            amount={transaction?.amount}
                                                        />

                                                        {transaction?.relatedSpentTransaction && (
                                                            <Transaction
                                                                key={transaction?.relatedSpentTransaction.messageId}
                                                                messageId={transaction?.relatedSpentTransaction.messageId}
                                                                network={this.props.match.params.network}
                                                                inputs={transaction?.relatedSpentTransaction.inputs.length}
                                                                outputs={transaction?.relatedSpentTransaction.outputs.length}
                                                                messageTangleStatus={transaction?.relatedSpentTransaction.messageTangleStatus}
                                                                date={transaction?.relatedSpentTransaction.date}
                                                                amount={transaction?.relatedSpentTransaction.amount}
                                                            />
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                        </div>
                                        <Pagination
                                            currentPage={this.state.currentPage}
                                            totalCount={this.txsHistory.length}
                                            pageSize={this.state.pageSize}
                                            siblingsCount={1}
                                            onPageChange={page =>
                                                this.setState({ currentPage: page },
                                                    () => {
                                                        const firstPageIndex = (this.state.currentPage - 1) * this.state.pageSize;
                                                        // Check if last page
                                                        const lastPageIndex = (this.state.currentPage === Math.ceil(this.txsHistory.length / this.state.pageSize)) ? this.txsHistory.length : firstPageIndex + this.state.pageSize;
                                                        this.updateTransactionHistoryDetails(firstPageIndex, lastPageIndex)
                                                        .catch(err => console.error(err));
                                                })}
                                        />
                                    </div>)}
                                    {this.props.match.params.network === 'stardust-testnet-4' && (
                                    <div className="section transaction--section">
                                        <div className="section--header row space-between">
                                            <div className="row middle">
                                                <h2>
                                                    Assets in Wallet ({this.assetHistory.length})
                                                </h2>
                                                <Modal icon={ModalIcon.Info} data={messageJSON} />
                                            </div>
                                            {this.state.assetStatus && (
                                                <div className="margin-t-s middle row">
                                                    {this.state.assetStatusBusy && (<Spinner />)}
                                                    <p className="status">
                                                        {this.state.assetStatus}
                                                    </p>
                                                </div>
                                            )}
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
                                                { this.currentPageAssets.map((asset, k) =>
                                                    (
                                                        <React.Fragment key={`${asset?.asset}${k}`}>
                                                            <Asset
                                                                key={k}
                                                                asset={asset?.asset}
                                                                network={this.props.match.params.network}
                                                                symbol={asset?.symbol}
                                                                quantity={asset?.quantity}
                                                                price={asset?.price}
                                                                value={asset?.value}
                                                                tableFormat={true}
                                                            />
                                                        </React.Fragment>
                                                    ))}
                                            </tbody>
                                        </table>

                                        {/* Only visible in mobile -- Card assets*/}
                                        <div className="transaction-cards">
                                            {this.currentPageAssets.map((asset, k) =>
                                                (
                                                    <React.Fragment key={`${asset?.asset}${k}`}>
                                                        <Asset
                                                            key={k}
                                                            asset={asset?.asset}
                                                            network={this.props.match.params.network}
                                                            symbol={asset?.symbol}
                                                            quantity={asset?.quantity}
                                                            price={asset?.price}
                                                            value={asset?.value}
                                                        />
                                                    </React.Fragment>
                                                ))}
                                        </div>
                                        <Pagination
                                            currentPage={this.state.assetCurrentPage}
                                            totalCount={this.assetHistory.length}
                                            pageSize={this.state.assetPageSize}
                                            siblingsCount={1}
                                            onPageChange={page =>
                                                this.setState({ assetCurrentPage: page },
                                                    () => {
                                                        const firstPageIndex = (this.state.assetCurrentPage - 1) * this.state.assetPageSize;
                                                        // Check if last page
                                                        const lastPageIndex = (this.state.assetCurrentPage === Math.ceil(this.assetHistory.length / this.state.assetPageSize)) ? this.assetHistory.length : firstPageIndex + this.state.assetPageSize;
                                                })}
                                        />
                                    </div>
                                    )}
                                    {this.props.match.params.network === 'stardust-testnet-4' && (
                                    <div className="section transaction--section">
                                        <div className="section--header row space-between">
                                            <div className="row middle">
                                                <h2>
                                                    NFTs in Wallet ({this.nftHistory.length})
                                                </h2>
                                                <Modal icon={ModalIcon.Info} data={messageJSON} />
                                            </div>
                                            {this.state.nftStatus && (
                                                <div className="margin-t-s middle row">
                                                    {this.state.nftStatusBusy && (<Spinner />)}
                                                    <p className="status">
                                                        {this.state.nftStatus}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="nft--section">
                                            { this.currentPageNFTs.map((nfts, k) =>
                                            (
                                                <React.Fragment key={`${nfts?.tokenID}${k}`}>
                                                    <NFT
                                                        key={k}
                                                        image={nfts?.image}
                                                        tokenName={nfts?.tokenName}
                                                        tokenID={nfts?.tokenID}
                                                    />
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        <Pagination
                                            currentPage={this.state.nftCurrentPage}
                                            totalCount={this.nftHistory.length}
                                            pageSize={this.state.nftPageSize}
                                            siblingsCount={1}
                                            onPageChange={page =>
                                                this.setState({ nftCurrentPage: page },
                                                    () => {
                                                        const firstPageIndex = (this.state.nftCurrentPage - 1) * this.state.nftPageSize;
                                                        // Check if last page
                                                        const lastPageIndex = (this.state.nftCurrentPage === Math.ceil(this.nftHistory.length / this.state.nftPageSize)) ? this.nftHistory.length : firstPageIndex + this.state.nftPageSize;
                                                })}
                                        />
                                    </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private get currentPageTransactions() {
        const firstPageIndex = (this.state.currentPage - 1) * this.state.pageSize;
        const lastPageIndex = firstPageIndex + this.state.pageSize;

        return this.txsHistory.slice(firstPageIndex, lastPageIndex);
    }

    private get currentPageAssets() {
        const firstPageIndex = (this.state.assetCurrentPage - 1) * this.state.assetPageSize;
        const lastPageIndex = firstPageIndex + this.state.assetPageSize;

        return this.assetHistory.slice(firstPageIndex, lastPageIndex);
    }

    private get currentPageNFTs() {
        const firstPageIndex = (this.state.nftCurrentPage - 1) * this.state.nftPageSize;
        const lastPageIndex = firstPageIndex + this.state.nftPageSize;

        return this.nftHistory.slice(firstPageIndex, lastPageIndex);
    }

    private get txsHistory() {
        return this.state.transactionHistory?.transactionHistory?.transactions ?? [];
    }

    private get assetHistory() {
        return [
            {
                asset: "Dogey Inu",
                symbol: "DINU",
                quantity: 1322212,
                price: 10303925,
                value: 363960,
                network: "stardust-testnet-4",
                tableFormat: true
            },
            {
                asset: "Dogey Inu",
                symbol: "DINU",
                quantity: 1322212,
                price: 10303925,
                value: 363960,
                network: "stardust-testnet-4",
                tableFormat: true
            }
        ];
    }

    private get nftHistory() {
        return [
            {
                image: "https://s3-alpha-sig.figma.com/img/7ee2/1c44/513c2eecf385851f2e3404fd252f3ada?Expires=1650240000&Signature=GB12NLwh~TJMo-kjwimpL0f69PN8OpJ3BtQFH-InK6CIZTq1VkHPEgNQ4YbxCwxMaW907mD2UQvGaomvRFd50byPp3H0MMq3w7FA3EUKWe-Y81jlQTMW4lsz~D4X5OIrqZztqd051D-ii1MMIV8S5Ck1aOJzZbN1vJQkxyZ0BsnJLjiH0M~sBJ8fg6OrB4PWQaOXXkcry2rddbJh3rX4KFMdXVSnk~RGQUdNXI0K6MZaofwbRrPllbNIrm6JoHBfjuwSmkMVdnN3mExv0ClbPu8fA6tHJbh4x7EKe30nUS4Wq8AesDI4yCQ7wkXHKr0OtOzuRFcPHP3Wh2F4p-gPLA__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA",
                tokenName: "Rarebits",
                tokenID: 43792
            },
            {
                image: "https://s3-alpha-sig.figma.com/img/6ded/2ee1/ae99a8eca45babc4b90cef71c24f663e?Expires=1650240000&Signature=FahPYNpfU4lZ08GMb6eaHwUnp0uNi8SUbLj0i4k9dItoN8R5OsZd9R45uJIpaht0Kxra2W3f9nn3AKepVCNk9ixdh~QZgaQStdn8mee7JeLt4dcl2dKlHHFxqStd3kvnawrpEkUJWxAbz0bFr7B4AEi2ancRgEIIg-hHroOhfPAyuiIKvSIHjk1iyuaktGPtplaps8bVN1WNFQi7Jt8crvlxr5m~ROxFCa4~RE0E7WxYVVy6iWo-Ts9s8XAPCA1OOEj9UBTPD6gAIGd4XjE9iSi~2GOohqCGp-H-neZYm1F1pUe1T9OJBzhVAWGeforVjwn36-ejVGqqlS~0tDkr5g__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA",
                tokenName: "Rarebits",
                tokenID: 73355
            },
            {
                image: "https://s3-alpha-sig.figma.com/img/9abe/b4d7/1a14ea658041bddc55c11e032e44331e?Expires=1650240000&Signature=P50SOA24dQytW30P0nAa-pxrmFST6rIDQXIX8OjU1QEviKPVwsd3-MuCIELg-hTEdeWM5GH53dgu7v9~ZXe-j0DRtVQXFHp6vtyQWHOrhGe5J8swzn~AIExDKKHcX8Fup3p-n6ZYXIYRqbfAbjvJnqyNO9CioL~UHxDgLl7oGR0dZhXnXdyo-I3Izv3wkIk5Iad7yG~R5b7Egg73IfkpWr47dxy9CqxdpdbBMBEra6vwmDVzH8OecIUgPP3Wx~XmnYwt~zaa-UcAOA12SC5bMXleoWSBGU1sTG9oNnk0WXGUnaHW38mrIeZvr8~HmH37QPf1SqTuq8hWhCH3kFnamA__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA",
                tokenName: "Rarebits",
                tokenID: 23355
            },
            {
                image: "https://s3-alpha-sig.figma.com/img/1661/31ac/578fa42b700f897791f592c00db6d63a?Expires=1650240000&Signature=GM3kJ5fA-GkQ1xMraS3tQGVfVFUIWAT618qcbwPRoWaSlv5eDl7HXrYNs70nMPhgitoEJRtdNVwe4u4~F4vD83fdiyXskmJ0Gz0qXhvPhy5iAgwC8AeslJpaK4xra4bAhbVqMACa7LLsDbkCd0fK2QYlVX-Z1NHPpfY0SKBmvHuodePEmEu381oaNEArQsEz97pAPbd~PWmAaXP42jXI9dlZ~f-ktjfvo5WxPSfvL5H2q9KNZ7rmPi5ZNw7cqAAwFHgh4O3uPCjFfASOOD56om3UXdxEChb-nG9sA-UfYfAytgc36ehOfubS0Nee2j3XB95IAQKgFgLDPRy2rGNOrQ__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA",
                tokenName: "Rarebits",
                tokenID: 23433
            },
            {
                image: "https://s3-alpha-sig.figma.com/img/1661/31ac/578fa42b700f897791f592c00db6d63a?Expires=1650240000&Signature=GM3kJ5fA-GkQ1xMraS3tQGVfVFUIWAT618qcbwPRoWaSlv5eDl7HXrYNs70nMPhgitoEJRtdNVwe4u4~F4vD83fdiyXskmJ0Gz0qXhvPhy5iAgwC8AeslJpaK4xra4bAhbVqMACa7LLsDbkCd0fK2QYlVX-Z1NHPpfY0SKBmvHuodePEmEu381oaNEArQsEz97pAPbd~PWmAaXP42jXI9dlZ~f-ktjfvo5WxPSfvL5H2q9KNZ7rmPi5ZNw7cqAAwFHgh4O3uPCjFfASOOD56om3UXdxEChb-nG9sA-UfYfAytgc36ehOfubS0Nee2j3XB95IAQKgFgLDPRy2rGNOrQ__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA",
                tokenName: "Rarebits",
                tokenID: 23478
            },
            {
                image: "https://s3-alpha-sig.figma.com/img/7ee2/1c44/513c2eecf385851f2e3404fd252f3ada?Expires=1650240000&Signature=GB12NLwh~TJMo-kjwimpL0f69PN8OpJ3BtQFH-InK6CIZTq1VkHPEgNQ4YbxCwxMaW907mD2UQvGaomvRFd50byPp3H0MMq3w7FA3EUKWe-Y81jlQTMW4lsz~D4X5OIrqZztqd051D-ii1MMIV8S5Ck1aOJzZbN1vJQkxyZ0BsnJLjiH0M~sBJ8fg6OrB4PWQaOXXkcry2rddbJh3rX4KFMdXVSnk~RGQUdNXI0K6MZaofwbRrPllbNIrm6JoHBfjuwSmkMVdnN3mExv0ClbPu8fA6tHJbh4x7EKe30nUS4Wq8AesDI4yCQ7wkXHKr0OtOzuRFcPHP3Wh2F4p-gPLA__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA",
                tokenName: "Rarebits",
                tokenID: 43792
            },
            {
                image: "https://s3-alpha-sig.figma.com/img/6ded/2ee1/ae99a8eca45babc4b90cef71c24f663e?Expires=1650240000&Signature=FahPYNpfU4lZ08GMb6eaHwUnp0uNi8SUbLj0i4k9dItoN8R5OsZd9R45uJIpaht0Kxra2W3f9nn3AKepVCNk9ixdh~QZgaQStdn8mee7JeLt4dcl2dKlHHFxqStd3kvnawrpEkUJWxAbz0bFr7B4AEi2ancRgEIIg-hHroOhfPAyuiIKvSIHjk1iyuaktGPtplaps8bVN1WNFQi7Jt8crvlxr5m~ROxFCa4~RE0E7WxYVVy6iWo-Ts9s8XAPCA1OOEj9UBTPD6gAIGd4XjE9iSi~2GOohqCGp-H-neZYm1F1pUe1T9OJBzhVAWGeforVjwn36-ejVGqqlS~0tDkr5g__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA",
                tokenName: "Rarebits",
                tokenID: 73355
            },
            {
                image: "https://s3-alpha-sig.figma.com/img/9abe/b4d7/1a14ea658041bddc55c11e032e44331e?Expires=1650240000&Signature=P50SOA24dQytW30P0nAa-pxrmFST6rIDQXIX8OjU1QEviKPVwsd3-MuCIELg-hTEdeWM5GH53dgu7v9~ZXe-j0DRtVQXFHp6vtyQWHOrhGe5J8swzn~AIExDKKHcX8Fup3p-n6ZYXIYRqbfAbjvJnqyNO9CioL~UHxDgLl7oGR0dZhXnXdyo-I3Izv3wkIk5Iad7yG~R5b7Egg73IfkpWr47dxy9CqxdpdbBMBEra6vwmDVzH8OecIUgPP3Wx~XmnYwt~zaa-UcAOA12SC5bMXleoWSBGU1sTG9oNnk0WXGUnaHW38mrIeZvr8~HmH37QPf1SqTuq8hWhCH3kFnamA__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA",
                tokenName: "Rarebits",
                tokenID: 23355
            },
            {
                image: "https://s3-alpha-sig.figma.com/img/1661/31ac/578fa42b700f897791f592c00db6d63a?Expires=1650240000&Signature=GM3kJ5fA-GkQ1xMraS3tQGVfVFUIWAT618qcbwPRoWaSlv5eDl7HXrYNs70nMPhgitoEJRtdNVwe4u4~F4vD83fdiyXskmJ0Gz0qXhvPhy5iAgwC8AeslJpaK4xra4bAhbVqMACa7LLsDbkCd0fK2QYlVX-Z1NHPpfY0SKBmvHuodePEmEu381oaNEArQsEz97pAPbd~PWmAaXP42jXI9dlZ~f-ktjfvo5WxPSfvL5H2q9KNZ7rmPi5ZNw7cqAAwFHgh4O3uPCjFfASOOD56om3UXdxEChb-nG9sA-UfYfAytgc36ehOfubS0Nee2j3XB95IAQKgFgLDPRy2rGNOrQ__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA",
                tokenName: "Rarebits",
                tokenID: 23433
            },
            {
                image: "https://s3-alpha-sig.figma.com/img/1661/31ac/578fa42b700f897791f592c00db6d63a?Expires=1650240000&Signature=GM3kJ5fA-GkQ1xMraS3tQGVfVFUIWAT618qcbwPRoWaSlv5eDl7HXrYNs70nMPhgitoEJRtdNVwe4u4~F4vD83fdiyXskmJ0Gz0qXhvPhy5iAgwC8AeslJpaK4xra4bAhbVqMACa7LLsDbkCd0fK2QYlVX-Z1NHPpfY0SKBmvHuodePEmEu381oaNEArQsEz97pAPbd~PWmAaXP42jXI9dlZ~f-ktjfvo5WxPSfvL5H2q9KNZ7rmPi5ZNw7cqAAwFHgh4O3uPCjFfASOOD56om3UXdxEChb-nG9sA-UfYfAytgc36ehOfubS0Nee2j3XB95IAQKgFgLDPRy2rGNOrQ__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA",
                tokenName: "Rarebits",
                tokenID: 23478
            },
            {
                image: "https://s3-alpha-sig.figma.com/img/7ee2/1c44/513c2eecf385851f2e3404fd252f3ada?Expires=1650240000&Signature=GB12NLwh~TJMo-kjwimpL0f69PN8OpJ3BtQFH-InK6CIZTq1VkHPEgNQ4YbxCwxMaW907mD2UQvGaomvRFd50byPp3H0MMq3w7FA3EUKWe-Y81jlQTMW4lsz~D4X5OIrqZztqd051D-ii1MMIV8S5Ck1aOJzZbN1vJQkxyZ0BsnJLjiH0M~sBJ8fg6OrB4PWQaOXXkcry2rddbJh3rX4KFMdXVSnk~RGQUdNXI0K6MZaofwbRrPllbNIrm6JoHBfjuwSmkMVdnN3mExv0ClbPu8fA6tHJbh4x7EKe30nUS4Wq8AesDI4yCQ7wkXHKr0OtOzuRFcPHP3Wh2F4p-gPLA__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA",
                tokenName: "Rarebits",
                tokenID: 43792
            },
            {
                image: "https://s3-alpha-sig.figma.com/img/6ded/2ee1/ae99a8eca45babc4b90cef71c24f663e?Expires=1650240000&Signature=FahPYNpfU4lZ08GMb6eaHwUnp0uNi8SUbLj0i4k9dItoN8R5OsZd9R45uJIpaht0Kxra2W3f9nn3AKepVCNk9ixdh~QZgaQStdn8mee7JeLt4dcl2dKlHHFxqStd3kvnawrpEkUJWxAbz0bFr7B4AEi2ancRgEIIg-hHroOhfPAyuiIKvSIHjk1iyuaktGPtplaps8bVN1WNFQi7Jt8crvlxr5m~ROxFCa4~RE0E7WxYVVy6iWo-Ts9s8XAPCA1OOEj9UBTPD6gAIGd4XjE9iSi~2GOohqCGp-H-neZYm1F1pUe1T9OJBzhVAWGeforVjwn36-ejVGqqlS~0tDkr5g__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA",
                tokenName: "Rarebits",
                tokenID: 73355
            },
            {
                image: "https://s3-alpha-sig.figma.com/img/9abe/b4d7/1a14ea658041bddc55c11e032e44331e?Expires=1650240000&Signature=P50SOA24dQytW30P0nAa-pxrmFST6rIDQXIX8OjU1QEviKPVwsd3-MuCIELg-hTEdeWM5GH53dgu7v9~ZXe-j0DRtVQXFHp6vtyQWHOrhGe5J8swzn~AIExDKKHcX8Fup3p-n6ZYXIYRqbfAbjvJnqyNO9CioL~UHxDgLl7oGR0dZhXnXdyo-I3Izv3wkIk5Iad7yG~R5b7Egg73IfkpWr47dxy9CqxdpdbBMBEra6vwmDVzH8OecIUgPP3Wx~XmnYwt~zaa-UcAOA12SC5bMXleoWSBGU1sTG9oNnk0WXGUnaHW38mrIeZvr8~HmH37QPf1SqTuq8hWhCH3kFnamA__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA",
                tokenName: "Rarebits",
                tokenID: 23355
            }
        ];
    }

    private async getTransactionHistory() {
        const transactionsDetails = await this._tangleCacheService.transactionsDetails({
            network: this.props.match.params.network,
            address: this.state.address?.address ?? "",
            query: { page_size: this.state.pageSize }
        }, false);

        this.setState({ transactionHistory: transactionsDetails },
            async () => {
                const firstPageIndex = (this.state.currentPage - 1) * this.state.pageSize;
                const lastPageIndex = (this.state.currentPage === Math.ceil(this.txsHistory.length / this.state.pageSize))
                    ? this.txsHistory.length : firstPageIndex + this.state.pageSize;
                this.updateTransactionHistoryDetails(firstPageIndex, lastPageIndex)
                    .catch(err => console.error(err));

                if (transactionsDetails?.transactionHistory?.state) {
                    const allTransactionsDetails = await this._tangleCacheService.transactionsDetails({
                        network: this.props.match.params.network,
                        address: this.state.address?.address ?? "",
                        query: { page_size: Addr.MAX_PAGE_SIZE, state: transactionsDetails?.transactionHistory.state }
                    }, true);

                    if (allTransactionsDetails?.transactionHistory.transactions) {
                        this.setState({ transactionHistory: { ...allTransactionsDetails,
                            transactionHistory: { ...allTransactionsDetails.transactionHistory,
                                transactions: allTransactionsDetails.transactionHistory
                                    .transactions?.map(t1 => ({ ...t1, ...this.txsHistory.find(t2 => t2.messageId === t1.messageId) })),
                                state: allTransactionsDetails.transactionHistory.state } } });
                    }
                }

                this.setState({
                    status: "",
                    statusBusy: false
                });
            }
        );
    }

    private async getAssetsHistory() {

        /**
         * Fetch assets history here
        */

        /**
         * After successfully fetching history set asset status and busy status
         */
        this.setState({
            assetStatus: "",
            assetStatusBusy: false
        });
    }

    private async getNFTsHistory() {

        /**
         * Fetch NFTs history here
        */

        /**
         * After successfully fetching history set NFT status and busy status
         */
        this.setState({
            nftStatus: "",
            nftStatusBusy: false
        });
    }

    private async updateTransactionHistoryDetails(startIndex: number, endIndex: number) {
        if (this.txsHistory.length > 0) {
            const transactionIds = this.txsHistory.map(transaction => transaction.messageId);
            const updatingPage = this.state.currentPage;

            for (let i = startIndex; i < endIndex; i++) {
                if (updatingPage !== this.state.currentPage) {
                    break;
                }

                const tsx = { ...this.txsHistory[i] };
                let isUpdated = false;

                if (!tsx.date || !tsx.messageTangleStatus) {
                    isUpdated = true;
                    const { date, messageTangleStatus } = await TransactionsHelper
                        .getMessageStatus(this.props.match.params.network, tsx.messageId,
                            this._tangleCacheService);
                    tsx.date = date;
                    tsx.messageTangleStatus = messageTangleStatus;
                }

                if (!tsx.amount) {
                    isUpdated = true;
                    const amount = await this.getTransactionAmount(tsx.messageId);
                    tsx.amount = amount;

                    if (amount < 0) {
                        this.setState({ sent: this.state.sent + Math.abs(amount) });
                    }
                }

                if (tsx.isSpent === undefined) {
                    isUpdated = true;
                    let isTransactionSpent = false;

                    // Get spent related transaction
                    for (const output of tsx.outputs) {
                        if (output.output.address.address === this.state.address?.address && output.spendingMessageId && !transactionIds?.includes(output.spendingMessageId)) {
                            transactionIds?.push(output.spendingMessageId);
                            const transactionsResult = await this._tangleCacheService.search(
                                this.props.match.params.network, output.spendingMessageId);
                            const statusDetails = await TransactionsHelper
                                .getMessageStatus(this.props.match.params.network, output.spendingMessageId,
                                    this._tangleCacheService);

                            if (transactionsResult?.message?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
                                const relatedAmount = await this.getTransactionAmount(output.spendingMessageId);
                                tsx.relatedSpentTransaction = {
                                    messageId: output.spendingMessageId,
                                    date: statusDetails.date,
                                    messageTangleStatus: statusDetails.messageTangleStatus,
                                    isSpent: true,
                                    amount: relatedAmount,
                                    inputs: transactionsResult?.message?.payload?.essence?.inputs,
                                    outputs: transactionsResult?.message?.payload?.essence?.outputs
                                };
                                if (relatedAmount < 0) {
                                    this.setState({ sent: this.state.sent + Math.abs(relatedAmount) });
                                }
                                isTransactionSpent = true;
                            }
                        }
                    }
                    tsx.isSpent = isTransactionSpent;
                }

                if (isUpdated) {
                    const transactions = [...this.txsHistory];
                    transactions[i] = tsx;
                    this.setState({ transactionHistory: { transactionHistory: { transactions } } });
                }
            }
        }
    }

    private async getTransactionAmount(
        messageId: string): Promise<number> {
        const result = await this._tangleCacheService.search(
            this.props.match.params.network, messageId);
        const { inputs, outputs } =
            await TransactionsHelper.getInputsAndOutputs(result?.message,
                this.props.match.params.network,
                this._bechHrp,
                this._tangleCacheService);
        const inputsRelated = inputs.filter(input => input.transactionAddress.hex === this.state.address?.address);
        const outputsRelated = outputs.filter(output => output.address.hex === this.state.address?.address);
        let fromAmount = 0;
        let toAmount = 0;
        for (const input of inputsRelated) {
            fromAmount += input.amount;
        }
        for (const output of outputsRelated) {
            toAmount += output.amount;
        }
        return toAmount - fromAmount;
    }
}

export default Addr;

