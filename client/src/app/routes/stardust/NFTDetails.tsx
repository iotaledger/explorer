import classNames from "classnames";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { INftActivityHistory } from "../../../models/api/stardust/INftDetailsResponse";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import CopyButton from "../../components/CopyButton";
import Icon from "../../components/Icon";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import { Activity } from "../../components/stardust/Activity";
import { NFTDetailsRouteProps } from "../NFTDetailsRouteProps";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import mainHeaderMessage from "./../../../assets/modals/block/main-header.json";
import { NFTDetailsState } from "./NFTDetailsState";
import "./NFTDetails.scss";

/**
 * Component which will show the nft detail page.
 */
class NFTDetails extends AsyncComponent<RouteComponentProps<NFTDetailsRouteProps>, NFTDetailsState> {
    /**
     * API Client for tangle requests.
     */
     private readonly _tangleCacheService: StardustTangleCacheService;

    /**
     * Create a new instance of Indexed.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<NFTDetailsRouteProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);

        this.state = {
            currentPage: 1,
            pageSize: 10,
            currentPageActivities: [],
            showGeneralItems: true,
            nftDetails: {
                imageSrc: "",
                amount: 0,
                quantity: 0,
                generalData: {
                    standard: "",
                    tokenId: "",
                    contractAddress: "",
                    creatorAddress: "",
                    senderAddress: "",
                    fileType: "",
                    network: ""
                },
                activityHistory: []
            }
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
        await this.getNftDetails();
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { currentPage, pageSize, showGeneralItems, nftDetails } = this.state;

        return (
            <div className="nft">
                <div className="wrapper">
                    {
                        nftDetails.activityHistory ?
                            <div className="inner">
                                <div className="nft--header">
                                    <div className="row middle">
                                        <h1>
                                            NFT #1
                                        </h1>
                                    </div>
                                </div>
                                <div className="section">
                                    <div className="section--data section-nft-detail">
                                        <img
                                            src={nftDetails.imageSrc}
                                            alt="bundle"
                                            className="nft-image"
                                        />
                                        <div className="nft-info">
                                            <div className="row">
                                                <Icon icon="wallet" boxed />
                                                <div className="balance">
                                                    <div className="label">
                                                        Buying Price
                                                    </div>
                                                    <div className="value featured">
                                                        <span>{nftDetails.quantity} Gi (${nftDetails.amount})</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="nft-list">
                                                <div
                                                    className={classNames("list--dropdown", "item",
                                                    { opened: showGeneralItems })}
                                                    onClick={() =>
                                                        this.setState({ showGeneralItems: !showGeneralItems })}
                                                >
                                                    <div className="margin-r-t icon">
                                                        <DropdownIcon />
                                                    </div>
                                                    <h2>General</h2>
                                                </div>
                                                {showGeneralItems &&
                                                    <ul className="general-items">
                                                        <li className="list">
                                                            <span className="label name">Token Standard</span>
                                                            <span className="label value margin-r-t">
                                                                {nftDetails?.generalData?.standard}
                                                            </span>
                                                        </li>
                                                        <li className="list">
                                                            <span className="label name">Token ID</span>
                                                            <div className="value code row middle">
                                                                <span className="label value">
                                                                    {nftDetails?.generalData?.tokenId}
                                                                </span>
                                                                <CopyButton
                                                                    onClick={() => ClipboardHelper.copy(
                                                                        nftDetails?.generalData?.tokenId
                                                                    )}
                                                                    buttonType="copy"
                                                                />
                                                            </div>
                                                        </li>
                                                        <li className="list">
                                                            <span className="label name">Contact Address</span>
                                                            <div className="value code row middle">
                                                                <span className="label value">
                                                                    {nftDetails?.generalData?.contractAddress}
                                                                </span>
                                                                <CopyButton
                                                                    onClick={() => ClipboardHelper.copy(
                                                                        nftDetails?.generalData?.contractAddress
                                                                    )}
                                                                    buttonType="copy"
                                                                />
                                                            </div>
                                                        </li>
                                                        <li className="list">
                                                            <span className="label name">Creator Address</span>
                                                            <div className="value code row middle">
                                                                <span className="label value">
                                                                    {nftDetails?.generalData?.creatorAddress}
                                                                </span>
                                                                <CopyButton
                                                                    onClick={() => ClipboardHelper.copy(
                                                                        nftDetails?.generalData?.creatorAddress
                                                                    )}
                                                                    buttonType="copy"
                                                                />
                                                            </div>
                                                        </li>
                                                        <li className="list">
                                                            <span className="label name">Sender Address</span>
                                                            <div className="value code row middle">
                                                                <span className="label value">
                                                                    {nftDetails?.generalData?.senderAddress}
                                                                </span>
                                                                <CopyButton
                                                                    onClick={() => ClipboardHelper.copy(
                                                                        nftDetails?.generalData?.senderAddress
                                                                    )}
                                                                    buttonType="copy"
                                                                />
                                                            </div>
                                                        </li>
                                                        <li className="list">
                                                            <span className="label name">File Type</span>
                                                            <span className="label value margin-r-t">
                                                                {nftDetails?.generalData?.fileType}
                                                            </span>
                                                        </li>
                                                        <li className="list">
                                                            <span className="label name">Network</span>
                                                            <span className="label value margin-r-t">
                                                                {nftDetails?.generalData?.network}
                                                            </span>
                                                        </li>
                                                    </ul>}
                                                <div
                                                    className={classNames("list--dropdown", "item",
                                                    { opened: false })}
                                                >
                                                    <div className="margin-r-t icon">
                                                        <DropdownIcon />
                                                    </div>
                                                    <h2>Attributes</h2>
                                                </div>
                                                <div
                                                    className={classNames("list--dropdown", "item",
                                                    { opened: false })}
                                                >
                                                    <div className="margin-r-t icon">
                                                        <DropdownIcon />
                                                    </div>
                                                    <h2>Description</h2>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="section activity--section">
                                    <div className="section--header row space-between">
                                        <div className="row middle">
                                            <h2>
                                                Item Activity
                                            </h2>
                                            <Modal icon="info" data={mainHeaderMessage} />
                                        </div>
                                    </div>
                                    <table className="activity-table">
                                        <thead>
                                            <tr>
                                                <th>Transaction Id</th>
                                                <th>Date</th>
                                                <th>Action</th>
                                                <th>Status</th>
                                                <th>Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            { this.currentPageActivities.map((activity, k) =>
                                                (
                                                    <React.Fragment key={`${activity?.transactionId}${k}`}>
                                                        <Activity
                                                            key={k}
                                                            transactionId={activity?.transactionId}
                                                            date={activity?.date}
                                                            action={activity?.action}
                                                            status={activity?.status}
                                                            price={activity?.price}
                                                            network={this.props.match.params.network}
                                                            tableFormat={true}
                                                        />
                                                    </React.Fragment>
                                                ))}
                                        </tbody>
                                    </table>
                                    {/* Only visible in mobile -- Card assets*/}
                                    <div className="activity-cards">
                                        {this.currentPageActivities.map((activity, k) =>
                                            (
                                                <React.Fragment key={`${activity?.transactionId}${k}`}>
                                                    <Activity
                                                        key={k}
                                                        transactionId={activity?.transactionId}
                                                        date={activity?.date}
                                                        action={activity?.action}
                                                        status={activity?.status}
                                                        price={activity?.price}
                                                        network={this.props.match.params.network}
                                                        tableFormat={false}
                                                    />
                                                </React.Fragment>
                                            ))}
                                    </div>
                                    <Pagination
                                        currentPage={currentPage}
                                        totalCount={nftDetails.activityHistory.length}
                                        pageSize={pageSize}
                                        siblingsCount={1}
                                        onPageChange={page => this.setState({ currentPage: page })}
                                    />
                                </div>
                            </div> :
                            <div className="content inner row middle center card">
                                <h2>No data available</h2>
                            </div>
                    }
                </div>
            </div>
        );
    }

    private get currentPageActivities(): INftActivityHistory[] {
        const firstPageIndex = (this.state.currentPage - 1) * this.state.pageSize;
        const lastPageIndex = firstPageIndex + this.state.pageSize;

        return this.state.nftDetails.activityHistory.slice(firstPageIndex, lastPageIndex);
    }

    private async getNftDetails() {
        const networkId = this.props.match.params.network;
        const nftId = this.props.match.params.nftId;

        const result = await this._tangleCacheService.nftDetails({
            network: networkId,
            nftId
        });

        if (result) {
            this.setState({ nftDetails: result });
        }
    }
}

export default NFTDetails;
