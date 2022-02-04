/* eslint-disable max-len */
import { UnitsHelper } from "@iota/iota.js";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import AsyncComponent from "../AsyncComponent";
import FiatValue from "../FiatValue";
import Modal from "../Modal";
import { ModalIcon } from "../ModalProps";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import messageJSON from "./../../../assets/modals/message.json";
import Bech32Address from "./Bech32Address";
import "./TransactionPayload.scss";
import { TransactionPayloadProps } from "./TransactionPayloadProps";
import { TransactionPayloadState } from "./TransactionPayloadState";


/**
 * Component which will display a transaction payload.
 */
class TransactionPayload extends AsyncComponent<TransactionPayloadProps, TransactionPayloadState> {
    /**
     * Create a new instance of TransactionPayload.
     * @param props The props.
     */

    constructor(props: TransactionPayloadProps) {
        super(props);

        this.state = {
            showInputDetails: -1,
            showOutputDetails: -1
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
            <div className="transaction-payload">
                <div className="section--header">
                    <div className="row middle">
                        <h2>
                            Transaction Payload
                        </h2>
                        <Modal icon={ModalIcon.Info} data={messageJSON} />
                    </div>
                    <div className="transaction-value">
                        <div>
                            <span className="value">
                                {UnitsHelper.formatUnits(this.props.transferTotal,
                                    UnitsHelper.calculateBest(this.props.transferTotal))}
                            </span>
                            <span className="dot-separator">•</span>
                            <span className="fiat-value">
                                <FiatValue value={this.props.transferTotal} />
                            </span>
                        </div>
                    </div>
                </div>
                <div className="row row--tablet-responsive fill">
                    <div className="card col fill">
                        <div className="card--header">
                            <h2 className="card--header__title">From</h2>
                            <span className="dot-separator">•</span>
                            <span>{this.props.inputs.length}</span>
                        </div>
                        <div className="card--content">
                            {this.props.inputs.map((input, idx) => (
                                <React.Fragment key={idx}>
                                    <div
                                        className="card--content__input"
                                        onClick={() => this.setState({ showInputDetails: this.state.showInputDetails === idx ? -1 : idx })}
                                    >
                                        <div className={classNames("margin-r-t", "card--content__input--dropdown", { opened: this.state.showInputDetails === idx })}>
                                            <DropdownIcon />
                                        </div>
                                        <Bech32Address
                                            network={this.props.network}
                                            history={this.props.history}
                                            addressDetails={input.transactionAddress}
                                            advancedMode={false}
                                            hideLabel
                                            truncateAddress
                                        />
                                        <div className="card--value">
                                            {UnitsHelper.formatBest(input.amount)}
                                        </div>
                                    </div>

                                    {this.state.showInputDetails === idx && (
                                        <React.Fragment>
                                            <div className="card--label"> Address</div>
                                            <div className="card--value">
                                                <Bech32Address
                                                    network={this.props.network}
                                                    history={this.props.history}
                                                    addressDetails={input.transactionAddress}
                                                    advancedMode
                                                    hideLabel
                                                    truncateAddress={false}
                                                />
                                            </div>
                                            <div className="card--label"> Transaction Id</div>
                                            <div className="card--value">
                                                <Link
                                                    to={input.transactionUrl}
                                                    className="margin-r-t"
                                                >
                                                    {input.transactionId}
                                                </Link>
                                            </div>
                                            <div className="card--label"> Transaction Output Index</div>
                                            <div className="card--value">{input.transactionOutputIndex}</div>
                                            <div className="card--label"> Signature</div>
                                            <div className="card--value">{input.signature}</div>
                                            <div className="card--label"> Public Key</div>
                                            <div className="card--value">{input.publicKey}</div>
                                        </React.Fragment>)}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="card col fill">
                        <div className="card--header">
                            <h2 className="card--header__title">To</h2>
                            <span className="dot-separator">•</span>
                            <span>{this.props.outputs.length}</span>
                        </div>
                        <div className="card--content">
                            {this.props.outputs.map((output, idx) => (
                                <React.Fragment key={idx}>
                                    <div
                                        className="card--content__input"
                                        onClick={() => this.setState({ showOutputDetails: this.state.showOutputDetails === idx ? -1 : idx })}
                                    >
                                        <div className={classNames("margin-r-t", "card--content__input--dropdown", "card--content__flex_between", { opened: this.state.showOutputDetails === idx })}>
                                            <DropdownIcon />
                                        </div>
                                        <Bech32Address
                                            network={this.props.network}
                                            history={this.props.history}
                                            addressDetails={output.address}
                                            advancedMode={false}
                                            hideLabel
                                            truncateAddress
                                        />
                                        <div className="card--value">
                                            {UnitsHelper.formatBest(output.amount)}
                                        </div>
                                    </div>

                                    {this.state.showOutputDetails === idx && (
                                        <React.Fragment>
                                            <div className="card--label"> Address</div>
                                            <div className="card--value">
                                                <Bech32Address
                                                    network={this.props.network}
                                                    history={this.props.history}
                                                    addressDetails={output.address}
                                                    advancedMode
                                                    hideLabel
                                                    truncateAddress={false}
                                                />
                                            </div>
                                        </React.Fragment>)}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default TransactionPayload;
