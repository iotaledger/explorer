import { IMessageMetadata, IOutputResponse, TRANSACTION_PAYLOAD_TYPE, UnitsHelper } from "@iota/iota.js";
import React, { ReactNode } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { Bech32AddressHelper } from "../../../helpers/bech32AddressHelper";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { NetworkService } from "../../../services/networkService";
import { SettingsService } from "../../../services/settingsService";
import { TangleCacheService } from "../../../services/tangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import Bech32Address from "../../components/chrysalis/Bech32Address";
import Output from "../../components/chrysalis/Output";
import MessageButton from "../../components/MessageButton";
import Spinner from "../../components/Spinner";
import Transaction from "./../../components/chrysalis/Transaction";
import { DateHelper } from "./../../../helpers/dateHelper";
import { MessageTangleStatus } from "./../../../models/messageTangleStatus";
import "./Addr.scss";
import { AddrRouteProps } from "./AddrRouteProps";
import { AddrState } from "./AddrState";

/**
 * Component which will show the address page.
 */
class Addr extends AsyncComponent<RouteComponentProps<AddrRouteProps>, AddrState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * Settings service.
     */
    private readonly _settingsService: SettingsService;

    /**
     * The hrp of bech addresses.
     */
    private readonly _bechHrp: string;

    /**
     * Timer to check to state update.
     */
    private _timerId?: NodeJS.Timer;

    /**
     * Create a new instance of Addr.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<AddrRouteProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");
        this._settingsService = ServiceFactory.get<SettingsService>("settings");

        const networkService = ServiceFactory.get<NetworkService>("network");
        const networkConfig = this.props.match.params.network
            ? networkService.get(this.props.match.params.network)
            : undefined;

        this._bechHrp = networkConfig?.bechHrp ?? "iot";

        const isAdvanced = this._settingsService.get().advancedMode ?? false;

        this.state = {
            ...Bech32AddressHelper.buildAddress(
                this._bechHrp,
                props.match.params.address
            ),
            formatFull: false,
            statusBusy: true,
            status: `Loading ${isAdvanced ? "outputs" : "balances"}...`,
            advancedMode: isAdvanced
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
                const outputs: IOutputResponse[] = [];

                if (result.addressOutputIds) {
                    const transactions = [];

                    for (const outputId of result.addressOutputIds) {
                        const outputResult = await this._tangleCacheService.outputDetails(
                            this.props.match.params.network, outputId);

                        if (outputResult) {
                            outputs.push(outputResult);

                            this.setState({
                                outputs,
                                status: `Loading ${this.state.advancedMode
                                    ? "Outputs" : "Balances"} [${outputs.length}/${result.addressOutputIds.length}]`
                            });

                            const transactionResult = await this._tangleCacheService.search(
                                this.props.match.params.network, outputResult.messageId);
                            if (transactionResult?.message?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
                                transactions.push({
                                    messageId: outputResult?.messageId,
                                    inputs: transactionResult?.message?.payload?.essence.inputs.length,
                                    outputs: transactionResult?.message?.payload?.essence.outputs.length,
                                    amount: outputResult?.output?.amount,
                                    messageTangleStatus: undefined,
                                    timestamp: undefined
                                });
                            }
                            if (transactionResult?.message) {
                                this.setState({
                                    transactions
                                }, async () => {
                                    await this.updateMessageStatus(outputResult.messageId);
                                });
                            }
                            if (!this._isMounted) {
                                break;
                            }
                        }

                        if (!this._isMounted) {
                            break;
                        }
                    }
                }

                const historicOutputs: IOutputResponse[] = [];

                if (result.historicAddressOutputIds) {
                    for (const outputId of result.historicAddressOutputIds) {
                        const outputResult = await this._tangleCacheService.outputDetails(
                            this.props.match.params.network, outputId);

                        if (outputResult) {
                            historicOutputs.push(outputResult);

                            this.setState({
                                historicOutputs,
                                status: `Loading ${this.state.advancedMode
                                    ? "Historic Outputs" : "Historic Balances"} [${historicOutputs.length}/${result.historicAddressOutputIds.length}]`
                            });
                        }

                        if (!this._isMounted) {
                            break;
                        }
                    }
                }
                this.setState({
                    outputs,
                    historicOutputs,
                    status: "",
                    statusBusy: false
                });
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
                            <h1>
                                Address
                            </h1>
                            <div className="addr--header__switch">
                                <span>Advanced View</span>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        className="margin-l-t"
                                        checked={this.state.advancedMode}
                                        onChange={e => this.setState(
                                            {
                                                advancedMode: e.target.checked
                                            },
                                            () => this._settingsService.saveSingle(
                                                "advancedMode",
                                                this.state.advancedMode))}
                                    />
                                    <span className="slider round" />
                                </label>
                            </div>
                        </div>
                        <div className="top">
                            <div className="sections">
                                <div className="section">
                                    <div className="section--header">
                                        <h2>
                                            General
                                        </h2>
                                    </div>
                                    <div className="section--content">
                                        <Bech32Address
                                            addressDetails={this.state.bech32AddressDetails}
                                            advancedMode={this.state.advancedMode}
                                        />
                                        {/* {this.state.balance !== undefined && this.state.balance !== 0 && (
                                            <div className="row fill margin-t-s margin-b-s value-buttons">
                                                <div className="col">
                                                    <ValueButton value={this.state.balance ?? 0} label="Balance" />
                                                </div>
                                                <div className="col">
                                                    <CurrencyButton
                                                        marketsRoute={`/${this.props.match.params.network}/markets`}
                                                        value={this.state.balance ?? 0}
                                                    />
                                                </div>
                                            </div>
                                        )} */}
                                        {this.state.balance !== undefined && this.state.balance === 0 && (
                                            <div>
                                                <div className="section--label">
                                                    Balance
                                                </div>
                                                <div className="section--value">
                                                    0
                                                </div>
                                            </div>
                                        )}
                                        {this.state.balance !== undefined && this.state.balance !== 0 && (
                                            <div>
                                                <div className="section--label">
                                                    Balance
                                                </div>
                                                <div className="section--value">
                                                    {this.state.balance} i
                                                </div>
                                            </div>
                                        )}
                                        {this.state.status && (
                                            <div className="middle row">
                                                {this.state.statusBusy && (<Spinner />)}
                                                <p className="status">
                                                    {this.state.status}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {this.state.outputs && this.state.outputs.length === 0 && (
                                    <div className="card">
                                        <div className="card--content">
                                            <p>
                                                There are no {this.state.advancedMode
                                                    ? "outputs" : "balances"} for this address.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {/* {this.state.advancedMode &&
                                    this.state.outputs &&
                                    this.state.outputIds &&
                                    this.state.outputs.length > 0 &&
                                    this.state.outputs.map((output, idx) => (
                                        <div className="card" key={idx}>
                                            <Output
                                                key={idx}
                                                index={idx + 1}
                                                network={this.props.match.params.network}
                                                history={this.props.history}
                                                id={this.state.outputIds ? this.state.outputIds[idx] : ""}
                                                output={output}
                                                advancedMode={this.state.advancedMode}
                                            />
                                        </div>
                                    ))} */}
                                {/* {!this.state.advancedMode &&
                                    this.state.outputs &&
                                    this.state.outputIds &&
                                    this.state.outputs.length > 0 && (
                                        <div className="card">
                                            <div className="card--header card--header__space-between">
                                                <h2>
                                                    Balances
                                                </h2>
                                            </div>
                                            <div className="card--content">
                                                {this.state.outputs.map((output, idx) => (
                                                    <div key={idx} className="margin-b-m">
                                                        <div className="card--value row middle">
                                                            <div
                                                                className="
                                                                card--label card--label__no-height margin-r-s"
                                                            >
                                                                Message
                                                            </div>
                                                            <span className="card--value card--value__no-margin">
                                                                <Link
                                                                    to={
                                                                        `/${this.props.match.params.network
                                                                        }/message/${output.messageId}`
                                                                    }
                                                                    className="margin-r-t"
                                                                >
                                                                    {output.messageId}
                                                                </Link>
                                                            </span>
                                                            <MessageButton
                                                                onClick={() => ClipboardHelper.copy(
                                                                    output.messageId
                                                                )}
                                                                buttonType="copy"
                                                                labelPosition="top"
                                                            />
                                                        </div>
                                                        <div className="card--value row middle">
                                                            <div
                                                                className="
                                                                card--label card--label__no-height margin-r-s"
                                                            >
                                                                Amount
                                                            </div>
                                                            <span className="card--value card--value__no-margin">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => this.setState(
                                                                        {
                                                                            formatFull: !this.state.formatFull
                                                                        }
                                                                    )}
                                                                >
                                                                    {this.state.formatFull
                                                                        ? `${output.output.amount} i`
                                                                        : UnitsHelper.formatBest(output.output.amount)}
                                                                </button>
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )} */}
                                {/* {this.state.advancedMode &&
                                    this.state.historicOutputs &&
                                    this.state.historicOutputIds &&
                                    this.state.historicOutputs.length > 0 && (
                                        <React.Fragment>
                                            <h2 className="margin-t-s margin-b-s">
                                                Historic Outputs
                                            </h2>
                                            {this.state.historicOutputs.map((output, idx) => (
                                                <div className="card card__secondary" key={idx}>
                                                    <Output
                                                        key={idx}
                                                        index={idx + 1}
                                                        network={this.props.match.params.network}
                                                        history={this.props.history}
                                                        id={this.state.historicOutputIds
                                                            ? this.state.historicOutputIds[idx] : ""}
                                                        output={output}
                                                        advancedMode={this.state.advancedMode}
                                                    />
                                                </div>
                                            ))}
                                        </React.Fragment>
                                    )} */}
                                {/* {!this.state.advancedMode &&
                                    this.state.historicOutputs &&
                                    this.state.historicOutputIds &&
                                    this.state.historicOutputs.length > 0 && (
                                        <div className="card card__secondary">
                                            <div className="card--header card--header__space-between">
                                                <h2>
                                                    Historic Balances
                                                </h2>
                                            </div>
                                            <div className="card--content">
                                                {this.state.historicOutputs.map((output, idx) => (
                                                    <div key={idx} className="margin-b-m">
                                                        <div className="card--value row middle">
                                                            <div
                                                                className="
                                                                card--label card--label__no-height margin-r-s"
                                                            >
                                                                Message
                                                            </div>
                                                            <span className="card--value card--value__no-margin">
                                                                <Link
                                                                    to={
                                                                        `/${this.props.match.params.network
                                                                        }/message/${output.messageId}`
                                                                    }
                                                                    className="margin-r-t"
                                                                >
                                                                    {output.messageId}
                                                                </Link>
                                                            </span>
                                                            <MessageButton
                                                                onClick={() => ClipboardHelper.copy(
                                                                    output.messageId
                                                                )}
                                                                buttonType="copy"
                                                                labelPosition="top"
                                                            />
                                                        </div>
                                                        <div className="card--value row middle">
                                                            <div
                                                                className="
                                                                card--label card--label__no-height margin-r-s"
                                                            >
                                                                Amount
                                                            </div>
                                                            <span className="card--value card--value__no-margin">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => this.setState(
                                                                        {
                                                                            formatFull: !this.state.formatFull
                                                                        }
                                                                    )}
                                                                >
                                                                    {this.state.formatFull
                                                                        ? `${output.output.amount} i`
                                                                        : UnitsHelper.formatBest(output.output.amount)}
                                                                </button>
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )} */}
                                {this.state.transactions && (
                                    <div className="section">
                                        <div className="section--header">
                                            <h2>
                                                Transaction History
                                            </h2>
                                        </div>
                                        <table className="transaction--table">
                                            <tr>
                                                <th>Message id</th>
                                                <th>Date</th>
                                                <th>Inputs</th>
                                                <th>Outputs</th>
                                                <th>Status</th>
                                                <th>Amount</th>
                                            </tr>
                                            {
                                                this.state.outputs?.map(output =>
                                                (
                                                    // <tr key={tx.messageId}>
                                                    //     <td className="section--value section--value__code featured">
                                                    //         <Link
                                                    //             to={
                                                    //                 `/${this.props.match.params.network
                                                    //                 }/message/${tx.messageId}`
                                                    //             }
                                                    //             className="margin-r-t"
                                                    //         >
                                                    //             {tx.messageId.slice(0, 7)}...{tx.messageId.slice(-7)}
                                                    //         </Link>
                                                    //     </td>
                                                    //     <td className="">{tx.timestamp}</td>
                                                    //     <td className="text-right">{tx.inputs}</td>
                                                    //     <td className="text-right">{tx.outputs}</td>
                                                    //     <td className="">{tx.messageTangleStatus}</td>
                                                    //     <td className="">{UnitsHelper.formatBest(tx.amount)}</td>
                                                    // </tr>


                                                    <Transaction
                                                        output={output}
                                                        network={this.props.match.params.network}
                                                    />
                                                )
                                                )
                                            }
                                        </table>
                                    </div>
                                )}


                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private async updateMessageStatus(msgId: string): Promise<void> {
        const details = await this._tangleCacheService.messageDetails(
            this.props.match.params.network, msgId ?? "");

        const txs = this.state.transactions?.map(tx =>
        ((tx.messageId === msgId)
            ? ({
                ...tx,
                messageTangleStatus: this.calculateStatus(details?.metadata)
            }
            ) : tx
        )
        );

        this.setState({
            transactions: txs
        }, async () => {
            if (details?.metadata?.referencedByMilestoneIndex) {
                await this.updateTimestamp(details?.metadata?.referencedByMilestoneIndex, msgId);
            }
            if (!details?.metadata?.referencedByMilestoneIndex) {
                this._timerId = setTimeout(async () => {
                    await this.updateMessageStatus(msgId);
                }, 10000);
            }
        });
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
            this.props.match.params.network, milestoneIndex);

        if (result) {
            const aux = this.state?.transactions?.map(tx =>
            (tx.messageId === msgId ? ({
                ...tx,
                timestamp: DateHelper.formatShort(DateHelper.milliseconds(result.timestamp))
            }
            ) : tx));
            this.setState({
                transactions: aux
            });
        }
    }
}

export default Addr;
