/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable react/no-unescaped-entities */
import classNames from "classnames";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import messageJSON from "../../../assets/modals/message.json";
import AsyncComponent from "../../components/AsyncComponent";
import Icon from "../../components/Icon";
import Modal from "../../components/Modal";
import { ModalIcon } from "../../components/ModalProps";
import Pagination from "../../components/Pagination";
import { Activity } from "../../components/stardust/Activity";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import { NFTDetailsRouteProps } from "./NFTDetailsRouteProps";
import { NFTDetailsState } from "./NFTDetailsState";
import "./NFTDetails.scss";

/**
 * Component which will show the nft detail page.
 */
class NFTDetails extends AsyncComponent<RouteComponentProps<NFTDetailsRouteProps>, NFTDetailsState> {
    /**
     * Create a new instance of Indexed.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<NFTDetailsRouteProps>) {
        super(props);

        this.state = {
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
                                    src="https://s3-alpha-sig.figma.com/img/7ee2/1c44/513c2eecf385851f2e3404fd252f3ada?Expires=1650240000&Signature=GB12NLwh~TJMo-kjwimpL0f69PN8OpJ3BtQFH-InK6CIZTq1VkHPEgNQ4YbxCwxMaW907mD2UQvGaomvRFd50byPp3H0MMq3w7FA3EUKWe-Y81jlQTMW4lsz~D4X5OIrqZztqd051D-ii1MMIV8S5Ck1aOJzZbN1vJQkxyZ0BsnJLjiH0M~sBJ8fg6OrB4PWQaOXXkcry2rddbJh3rX4KFMdXVSnk~RGQUdNXI0K6MZaofwbRrPllbNIrm6JoHBfjuwSmkMVdnN3mExv0ClbPu8fA6tHJbh4x7EKe30nUS4Wq8AesDI4yCQ7wkXHKr0OtOzuRFcPHP3Wh2F4p-gPLA__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA"
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
                                                <span>0</span>
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
