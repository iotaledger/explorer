/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-warning-comments */
import { NFT_OUTPUT_TYPE } from "@iota/iota.js-stardust";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import messageJSON from "../../../assets/modals/message.json";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { STARDUST } from "../../../models/db/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import Icon from "../../components/Icon";
import Modal from "../../components/Modal";
import { ModalIcon } from "../../components/ModalProps";
import Pagination from "../../components/Pagination";
import { Activity } from "../../components/stardust/Activity";
import { NFTDetailsRouteProps } from "../NFTDetailsRouteProps";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import INftDetails from "./INftDetails";
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
            nftId: "",
            amount: 0,
            currentPage: 1,
            pageSize: 10,
            currentPageActivities: [],
            showGeneralItems: true,
            showAttributes: false,
            showDescription: false
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
        return (
            <div className="nft">
                <div className="wrapper">
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
                                    src="https://cdn.pixabay.com/photo/2021/11/06/14/40/nft-6773494_960_720.png"
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
                                                <span>1.25 Gi (${this.state.amount})</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="nft-list">
                                        <div
                                            className={classNames("list--dropdown", "item",
                                            { opened: this.state.showGeneralItems })}
                                            onClick={() =>
                                                this.setState({ showGeneralItems: !this.state.showGeneralItems })}
                                        >
                                            <div className="margin-r-t icon">
                                                <DropdownIcon />
                                            </div>
                                            <span>General</span>
                                        </div>
                                        {this.state.showGeneralItems &&
                                            <ul className="general-items">
                                                <li className="list">
                                                    <span className="label name">Token Standard</span>
                                                    <span className="label value">ERC-1155</span>
                                                </li>
                                                <li className="list">
                                                    <span className="label name">Token ID</span>
                                                    <span className="label value">{this.state.nftId.slice(0, 6)}...{this.state.nftId.slice(-2)}</span>
                                                </li>
                                                <li className="list">
                                                    <span className="label name">Contact Address</span>
                                                    <span className="label value">0x57b0...59</span>
                                                </li>
                                                <li className="list">
                                                    <span className="label name">Creator Address</span>
                                                    <span className="label value">0x57b0...44</span>
                                                </li>
                                                <li className="list">
                                                    <span className="label name">Sender Address</span>
                                                    <span className="label value">0x57b0...44</span>
                                                </li>
                                                <li className="list">
                                                    <span className="label name">File Type</span>
                                                    <span className="label value">JPG</span>
                                                </li>
                                                <li className="list">
                                                    <span className="label name">Network</span>
                                                    <span className="label value">Layer 2 network</span>
                                                </li>
                                            </ul>}
                                        <div
                                            className={classNames("list--dropdown", "item",
                                            { opened: this.state.showAttributes })}
                                            onClick={() =>
                                                this.setState({ showAttributes: !this.state.showAttributes })}
                                        >
                                            <div className="margin-r-t icon">
                                                <DropdownIcon />
                                            </div>
                                            <span>Attributes</span>
                                        </div>
                                        {this.state.showAttributes &&
                                        <ul className="general-items">
                                            <li className="list">
                                                <span className="label name">Token Standard</span>
                                                <span className="label value">ERC-1155</span>
                                            </li>
                                            <li className="list">
                                                <span className="label name">Token ID</span>
                                                <span className="label value">21391039</span>
                                            </li>
                                            <li className="list">
                                                <span className="label name">Contact Address</span>
                                                <span className="label value">0x57b0...59</span>
                                            </li>
                                            <li className="list">
                                                <span className="label name">Creator Address</span>
                                                <span className="label value">0x57b0...44</span>
                                            </li>
                                            <li className="list">
                                                <span className="label name">Sender Address</span>
                                                <span className="label value">0x57b0...44</span>
                                            </li>
                                            <li className="list">
                                                <span className="label name">File Type</span>
                                                <span className="label value">JPG</span>
                                            </li>
                                            <li className="list">
                                                <span className="label name">Network</span>
                                                <span className="label value">Layer 2 network</span>
                                            </li>
                                        </ul>}
                                        <div
                                            className={classNames("list--dropdown", "item",
                                            { opened: this.state.showDescription })}
                                            onClick={() =>
                                            this.setState({ showDescription: !this.state.showDescription })}
                                        >
                                            <div className="margin-r-t icon">
                                                <DropdownIcon />
                                            </div>
                                            <span>Description</span>
                                        </div>
                                        {this.state.showDescription &&
                                        <ul className="general-items">
                                            <li className="list">
                                                <span className="label name">Token Standard</span>
                                                <span className="label value">ERC-1155</span>
                                            </li>
                                            <li className="list">
                                                <span className="label name">Token ID</span>
                                                <span className="label value">21391039</span>
                                            </li>
                                            <li className="list">
                                                <span className="label name">Contact Address</span>
                                                <span className="label value">0x57b0...59</span>
                                            </li>
                                            <li className="list">
                                                <span className="label name">Creator Address</span>
                                                <span className="label value">0x57b0...44</span>
                                            </li>
                                            <li className="list">
                                                <span className="label name">Sender Address</span>
                                                <span className="label value">0x57b0...44</span>
                                            </li>
                                            <li className="list">
                                                <span className="label name">File Type</span>
                                                <span className="label value">JPG</span>
                                            </li>
                                            <li className="list">
                                                <span className="label name">Network</span>
                                                <span className="label value">Layer 2 network</span>
                                            </li>
                                        </ul>}
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
                                    <Modal icon={ModalIcon.Info} data={messageJSON} />
                                </div>
                            </div>
                            <table className="transaction--table">
                                <thead>
                                    <tr>
                                        <th>T'XN Hash</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                        <th>Status</th>
                                        <th>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { this.currentPageActivities.map((activity, k) =>
                                        (
                                            <React.Fragment key={`${activity?.hash}${k}`}>
                                                <Activity
                                                    key={k}
                                                    hash={activity?.hash}
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
                            <div className="transaction-cards">
                                {this.currentPageActivities.map((activity, k) =>
                                    (
                                        <React.Fragment key={`${activity?.hash}${k}`}>
                                            <Activity
                                                key={k}
                                                hash={activity?.hash}
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
                                currentPage={this.state.currentPage}
                                totalCount={this.activityHistory.length}
                                pageSize={this.state.pageSize}
                                siblingsCount={1}
                                onPageChange={page =>
                                    this.setState({ currentPage: page },
                                        () => {
                                            const firstPageIndex = (this.state.currentPage - 1) * this.state.pageSize;
                                            // Check if last page
                                            const lastPageIndex = (this.state.currentPage === Math.ceil(this.activityHistory.length / this.state.pageSize)) ? this.activityHistory.length : firstPageIndex + this.state.pageSize;
                                    })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private get currentPageActivities() {
        const firstPageIndex = (this.state.currentPage - 1) * this.state.pageSize;
        const lastPageIndex = firstPageIndex + this.state.pageSize;

        return this.activityHistory.slice(firstPageIndex, lastPageIndex);
    }

    private async getNftDetails() {
        const networkId = this.props.match.params.network;
        const nftId = this.props.match.params.nftId;

        const nftOutputs = await this._tangleCacheService.nftDetails({
            network: networkId,
            nftId
        });

        if (nftOutputs?.outputs && nftOutputs?.outputs?.items.length > 0) {
            for (const outputId of nftOutputs.outputs.items) {
                const output = await this._tangleCacheService.outputDetails(networkId, outputId);

                if (output && !output.isSpent && output.output.type === NFT_OUTPUT_TYPE) {
                    const nftDetails = output.output;
                    this.setState({
                        amount: Number(nftDetails.amount),
                        nftId: nftDetails.nftId
                    });
                }
            }
        }
    }

    private get activityHistory() {
        return [
            {
                hash: "0x57b0...59",
                date: "2021-06-18 01:32 AM",
                action: "Sale",
                status: "Confirmed",
                price: "+1.25 Gi",
                network: "alphanet-1",
                tableFormat: true
            },
            {
                hash: "0x57b0...59",
                date: "2021-06-18 01:32 AM",
                action: "Sale",
                status: "Confirmed",
                price: "+1.25 Gi",
                network: "alphanet-1",
                tableFormat: true
            },
            {
                hash: "0x57b0...59",
                date: "2021-06-18 01:32 AM",
                action: "Sale",
                status: "Confirmed",
                price: "+1.25 Gi",
                network: "alphanet-1",
                tableFormat: true
            },
            {
                hash: "0x57b0...59",
                date: "2021-06-18 01:32 AM",
                action: "Sale",
                status: "Confirmed",
                price: "+1.25 Gi",
                network: "alphanet-1",
                tableFormat: true
            },
            {
                hash: "0x57b0...59",
                date: "2021-06-18 01:32 AM",
                action: "Sale",
                status: "Confirmed",
                price: "+1.25 Gi",
                network: "alphanet-1",
                tableFormat: true
            },
            {
                hash: "0x57b0...59",
                date: "2021-06-18 01:32 AM",
                action: "Sale",
                status: "Confirmed",
                price: "+1.25 Gi",
                network: "alphanet-1",
                tableFormat: true
            },
            {
                hash: "0x57b0...59",
                date: "2021-06-18 01:32 AM",
                action: "Sale",
                status: "Confirmed",
                price: "+1.25 Gi",
                network: "alphanet-1",
                tableFormat: true
            },
            {
                hash: "0x57b0...59",
                date: "2021-06-18 01:32 AM",
                action: "Sale",
                status: "Confirmed",
                price: "+1.25 Gi",
                network: "alphanet-1",
                tableFormat: true
            },
            {
                hash: "0x57b0...59",
                date: "2021-06-18 01:32 AM",
                action: "Sale",
                status: "Confirmed",
                price: "+1.25 Gi",
                network: "alphanet-1",
                tableFormat: true
            },
            {
                hash: "0x57b0...59",
                date: "2021-06-18 01:32 AM",
                action: "Sale",
                status: "Confirmed",
                price: "+1.25 Gi",
                network: "alphanet-1",
                tableFormat: true
            },
            {
                hash: "0x57b0...59",
                date: "2021-06-18 01:32 AM",
                action: "Sale",
                status: "Confirmed",
                price: "+1.25 Gi",
                network: "alphanet-1",
                tableFormat: true
            },
            {
                hash: "0x57b0...59",
                date: "2021-06-18 01:32 AM",
                action: "Sale",
                status: "Confirmed",
                price: "+1.25 Gi",
                network: "alphanet-1",
                tableFormat: true
            },
            {
                hash: "0x57b0...59",
                date: "2021-06-18 01:32 AM",
                action: "Sale",
                status: "Confirmed",
                price: "+1.25 Gi",
                network: "alphanet-1",
                tableFormat: true
            },
            {
                hash: "0x57b0...59",
                date: "2021-06-18 01:32 AM",
                action: "Sale",
                status: "Confirmed",
                price: "+1.25 Gi",
                network: "alphanet-1",
                tableFormat: true
            }
        ];
    }
}

export default NFTDetails;
