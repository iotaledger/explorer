/* eslint-disable max-len */
import { TRANSACTION_PAYLOAD_TYPE, UnitsHelper } from "@iota/iota.js";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { TangleCacheService } from "../../../services/tangleCacheService";
import { DateHelper } from "./../../../helpers/dateHelper";
import { MessageTangleStatus } from "./../../../models/messageTangleStatus";
import { TransactionProps } from "./TransactionProps";
import { TransactionState } from "./TransactionState";


/**
 * Component which will display a transaction.
 */
class Transaction extends Component<TransactionProps, TransactionState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * Create a new instance of Transaction.
     * @param props The props.
     */
    constructor(props: TransactionProps) {
        super(props);
        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        const outputResult = await this._tangleCacheService.search(
            this.props.network, this.props.output.messageId);

        if (outputResult?.message?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
            this.setState({
                inputs: outputResult.message?.payload?.essence?.inputs.length,
                outputs: outputResult.message?.payload?.essence?.outputs.length
            });

            const details = await this._tangleCacheService.messageDetails(
                this.props.network, this.props.output.messageId ?? "");
            if (details) {
                let messageTangleStatus: MessageTangleStatus = "unknown";

                if (details?.metadata) {
                    if (details.metadata.milestoneIndex) {
                        messageTangleStatus = "milestone";
                    } else if (details.metadata.referencedByMilestoneIndex) {
                        messageTangleStatus = "referenced";
                    } else {
                        messageTangleStatus = "pending";
                    }

                    this.setState({
                        messageTangleStatus
                    });
                }
                const milestoneIndex = details?.metadata?.referencedByMilestoneIndex;
                if (milestoneIndex) {
                    const result = await this._tangleCacheService.milestoneDetails(
                        this.props.network, milestoneIndex);
                    if (result?.timestamp) {
                        this.setState({
                            date: DateHelper.formatShort(DateHelper.milliseconds(result.timestamp))
                        });
                    }
                }
            }
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <tr>
                <td className="section--value section--value__code featured">
                    <Link
                        to={
                            `/${this.props.network
                            }/message/${this.props.output.messageId}`
                        }
                        className="margin-r-t"
                    >
                        {this.props.output.messageId.slice(0, 7)}...{this.props.output.messageId.slice(-7)}
                    </Link>
                </td>
                <td>{this.state?.date}</td>
                <td>{this.state?.inputs}</td>
                <td>{this.state?.outputs}</td>
                <td>{this.state?.messageTangleStatus === "referenced" ? "confirmed" : this.state?.messageTangleStatus}</td>
                <td>{UnitsHelper.formatBest(this.props.output.output.amount)}</td>
            </tr>
        );
    }
}

export default Transaction;
