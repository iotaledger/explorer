import { IMessageMetadata, TRANSACTION_PAYLOAD_TYPE } from "@iota/iota.js";
import React, { ReactNode } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { TangleCacheService } from "../../../services/tangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import { DateHelper } from "./../../../helpers/dateHelper";
import { MessageTangleStatus } from "./../../../models/messageTangleStatus";
import { TransactionHistoryProps } from "./TransactionHistoryProps";
import { TransactionHistoryState } from "./TransactionHistoryState";


/**
 * Component which will show the address page.
 */
class TransactionHistory extends AsyncComponent<TransactionHistoryProps, TransactionHistoryState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
      * Timer to check to state update.
      */
    private _timerId?: NodeJS.Timer;

    /**
     * Create a new instance of Addr.
     * @param props The props.
     */
    constructor(props: TransactionHistoryProps) {
        super(props);
        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");
    }



    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        // this.setState({}, async () => {
        //     const transactions = [];

        //     if (this.props.outputs) {
        //         for (const output of this.props.outputs) {
        //             const result = await this._tangleCacheService.search(
        //                 this.props.network, output.messageId);
        //             if (result?.message?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
        //                 transactions.push({
        //                     messageId: output?.messageId,
        //                     inputs: result?.message?.payload?.essence.inputs.length,
        //                     outputs: result?.message?.payload?.essence.outputs.length,
        //                     amount: output?.output?.amount,
        //                     messageTangleStatus: undefined,
        //                     timestamp: undefined
        //                 });
        //             }
        //             if (result?.message) {
        //                 this.setState({
        //                     transactions
        //                 }, async () => {
        //                     await this.updateMessageStatus(output.messageId);
        //                 });
        //             }
        //             if (!this._isMounted) {
        //                 break;
        //             }
        //         }
        //     }
        // });
        this.getTransactions();
    }

    /**
   * The component was updated.
   * @param prevProps The previous properties.
   */
    public componentDidUpdate(prevProps: TransactionHistoryProps): void {
        console.log("Did Update!!!!!!!!");
        console.log("numero de tx!!!!!!!!", this?.props?.outputs?.length);
        console.log("this.props.outputs", this?.props?.outputs);
        console.log("prevProps.outputs", prevProps.outputs);
        console.log("prevProps.outputs !== this.props.outputs", this.props.outputs !== prevProps.outputs);
        if (this.props.outputs !== prevProps.outputs) {
            this.setState({}, async () => {
                const transactions = [];

                if (this.props.outputs) {
                    for (const output of this.props.outputs) {
                        const result = await this._tangleCacheService.search(
                            this.props.network, output.messageId);
                        if (result?.message?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
                            console.log("TRANSACTION_PAYLOAD_TYPE", result?.message);
                            transactions.push({
                                messageId: output?.messageId,
                                inputs: result?.message?.payload?.essence.inputs.length,
                                outputs: result?.message?.payload?.essence.outputs.length,
                                amount: output?.output?.amount,
                                messageTangleStatus: undefined,
                                timestamp: undefined
                            });
                        }
                        if (result?.message) {
                            this.setState({
                                transactions
                            }, async () => {
                                await this.updateMessageStatus(output.messageId);
                            });
                        }
                        if (!this._isMounted) {
                            break;
                        }
                    }
                }
            });
        }
    }

    /**
    * The component will unmount so update flag.
    */
    public componentWillUnmount(): void {
        super.componentWillUnmount();
        if (this._timerId) {
            clearTimeout(this._timerId);
            this._timerId = undefined;
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        console.log("this.props.outputs", this.props.outputs);
        return (
            <React.Fragment>

                <div className="section">
                    <div className="section--header">
                        <h2>
                            Transaction History
                        </h2>
                    </div>
                    <div className="section--grid grid-col-6">
                        <div className="section--label">Message Id</div>
                        <div className="section--label">Date</div>
                        <div className="section--label">Inputs</div>
                        <div className="section--label">Outputs</div>
                        <div className="section--label">Status</div>
                        <div className="section--label">Amount</div>
                    </div>
                </div>
                <div>
                    {this.state?.transactions && (
                        this.state.transactions.map(tx =>
                        (
                            <div key={tx.messageId}>
                                <p>Message id: {tx.messageId}</p>
                                <p>Inputs: {tx.inputs}</p>
                                <p>Outputs: {tx.outputs}</p>
                                <p>Amount: {tx.amount}</p>
                                <p>Status: {tx.messageTangleStatus}</p>
                                <p>Date: {tx.timestamp}</p>
                            </div>
                        )
                        )
                    )}
                </div>
            </React.Fragment >
        );
    }

    /**
      * Update the message tangle status.
      * @param msgId The message id.
      */
    private async updateMessageStatus(msgId: string): Promise<void> {
        const details = await this._tangleCacheService.messageDetails(
            this.props.network, msgId ?? "");

        const aux = this.state.transactions.map(tx =>
        ((tx.messageId === msgId)
            ? ({
                ...tx,
                messageTangleStatus: this.calculateStatus(details?.metadata)
            }
            ) : tx
        )
        );

        this.setState({
            transactions: aux
        }, async () => {
            if (details?.metadata?.referencedByMilestoneIndex) {
                await this.updateTimestamp(details?.metadata?.referencedByMilestoneIndex, msgId)
            }
        });

        if (!details?.metadata?.referencedByMilestoneIndex) {
            this._timerId = setTimeout(async () => {
                await this.updateMessageStatus(msgId);
            }, 10000);
        }
    }

    /**
     * Calculate the status for the message.
     * @param metadata The metadata to calculate the status from.
     * @returns The message status.
     */
    private calculateStatus(metadata?: IMessageMetadata): MessageTangleStatus {
        let messageTangleStatus: MessageTangleStatus = "unknown";

        if (metadata) {
            if (metadata.milestoneIndex) {
                messageTangleStatus = "milestone";
            } else if (metadata.referencedByMilestoneIndex) {
                messageTangleStatus = "referenced";
            } else {
                messageTangleStatus = "pending";
            }
        }

        return messageTangleStatus;
    }

    /**
     * Calculate the status for the message.
     * @param milestoneIndex The Milestone id.
     * @param msgId The message id.
     */
    private async updateTimestamp(milestoneIndex: number, msgId: string): Promise<void> {
        const result = await this._tangleCacheService.milestoneDetails(
            this.props.network, milestoneIndex);

        const aux = this.state.transactions.map(tx =>
        (tx.messageId === msgId ? ({
            ...tx,
            timestamp: this.calculateTimestamp(result?.timestamp)
        }
        ) : tx));
        if (result) {
            this.setState({
                transactions: aux
            });
        }
    }

    /**
      * Calculate the formated date for the message.
      * @param timestamp The timetamp in milliseconds.
      * @returns The message status.
      */
    private calculateTimestamp(timestamp?: number): string {
        if (timestamp) {
            return DateHelper.formatShort(DateHelper.milliseconds(timestamp));
        }
        return "No referenced";
    }

    private async getTransactions() {
        const transactions = [];

        if (this.props.outputs) {
            for (const output of this.props.outputs) {
                const result = await this._tangleCacheService.search(
                    this.props.network, output.messageId);
                if (result?.message?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
                    console.log("transaction payload type", result.message);
                    transactions.push({
                        messageId: output?.messageId,
                        inputs: result?.message?.payload?.essence.inputs.length,
                        outputs: result?.message?.payload?.essence.outputs.length,
                        amount: output?.output?.amount,
                        messageTangleStatus: undefined,
                        timestamp: undefined
                    });
                }
                if (result?.message) {
                    this.setState({
                        transactions
                    }, async () => {
                        await this.updateMessageStatus(output.messageId);
                    });
                }
                if (!this._isMounted) {
                    break;
                }
            }
        }
    }
}

export default TransactionHistory;
