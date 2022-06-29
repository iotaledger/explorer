import { TRANSACTION_PAYLOAD_TYPE } from "@iota/iota.js-stardust";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import CopyButton from "../../components/CopyButton";
import Modal from "../../components/Modal";
import TransactionPayload from "../../components/stardust/TransactionPayload";
import NetworkContext from "../../context/NetworkContext";
import mainHeaderMessage from "./../../../assets/modals/address/main-header.json";
import { TransactionsHelper } from "./../../../helpers/stardust/transactionsHelper";
import "./TransactionPage.scss";
import { TransactionPageProps } from "./TransactionPageProps";
import { TransactionPageState } from "./TransactionPageState";

/**
 * Component which will show the Transaction page for stardust.
 */
class TransactionPage extends AsyncComponent<RouteComponentProps<TransactionPageProps>, TransactionPageState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: StardustTangleCacheService;

    /**
     * Create a new instance of Transaction.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<TransactionPageProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(
            `tangle-cache-${STARDUST}`
        );

        this.state = {
            transactionId: this.props.match.params.transactionId
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        const block = await this._tangleCacheService.transactionIncludedBlockDetails(
            this.props.match.params.network, this.state.transactionId
        );

        if (block?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
            const { inputs, outputs, transferTotal } =
            await TransactionsHelper.getInputsAndOutputs(
                block,
                this.props.match.params.network,
                this.context.bech32Hrp,
                this._tangleCacheService
            );

            this.setState({
                inputs,
                outputs,
                transferTotal,
                block: block,
                networkId: block.payload.essence.networkId,
                inputsCommitment: block.payload.essence.inputsCommitment
            });
        } else {
            this.props.history.replace(`/${this.props.match.params.network
            }/search/${this.state.transactionId}`);
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const network = this.props.match.params.network;

        return (
            <div className="transaction-page">
                <div className="wrapper">
                    <div className="inner">
                        <div className="transaction-page--header">
                            <div className="row middle">
                                <h1>
                                    Transaction
                                </h1>
                                <Modal icon="info" data={mainHeaderMessage} />
                            </div>
                        </div>
                        <div className="section">
                            <div className="section--header row row--tablet-responsive middle space-between">
                                <div className="row middle">
                                    <h2>General</h2>
                                </div>
                            </div>
                            <div className="section--data">
                                <div className="label">
                                    Transaction ID
                                </div>
                                <div className="value code row middle">
                                    <span className="margin-r-t">
                                        {this.state.transactionId}
                                    </span>
                                    <CopyButton
                                        onClick={() => ClipboardHelper.copy(
                                            this.state.transactionId
                                        )}
                                        buttonType="copy"
                                    />
                                </div>
                            </div>
                            {this.state.networkId && (
                                <div className="section--data">
                                    <div className="label">
                                        Network ID
                                    </div>
                                    <div className="value code row middle">
                                        <span className="margin-r-t">
                                            {this.state.networkId}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {this.state.inputsCommitment && (
                                <div className="section--data">
                                    <div className="label">
                                        Input commitment
                                    </div>
                                    <div className="value code row middle">
                                        <span className="margin-r-t">
                                            {this.state.inputsCommitment}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {this.state.block?.nonce && (
                                <div className="section--data">
                                    <div className="label">
                                        Nonce
                                    </div>
                                    <div className="value row middle">
                                        <span className="margin-r-t">{this.state.block?.nonce}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <React.Fragment>
                            {this.state.inputs &&
                                this.state.outputs &&
                                this.state.transferTotal !== undefined &&
                                (
                                    <div className="section">
                                        <TransactionPayload
                                            network={network}
                                            history={this.props.history}
                                            inputs={this.state.inputs}
                                            outputs={this.state.outputs}
                                            transferTotal={this.state.transferTotal}
                                        />
                                    </div>
                                )}
                        </React.Fragment>
                    </div>
                </div>
            </div >
        );
    }
}

export default TransactionPage;
