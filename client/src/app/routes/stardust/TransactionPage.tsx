/* eslint-disable max-len */
import { TRANSACTION_PAYLOAD_TYPE, TransactionHelper } from "@iota/iota.js-stardust";
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

        this.state = {};
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        const block = await this._tangleCacheService.transactionIncludedBlockDetails(
            this.props.match.params.network, this.props.match.params.transactionId
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
                block,
                tangleNetworkId: block.payload.essence.networkId,
                inputsCommitment: block.payload.essence.inputsCommitment,
                includedBlockId: TransactionHelper.calculateBlockId(block)
            });
        } else {
            this.props.history.replace(`/${this.props.match.params.network}/search/${this.props.match.params.transactionId}`);
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const network = this.props.match.params.network;
        const transactionId = this.props.match.params.transactionId;
        const { inputs, outputs, transferTotal, block, tangleNetworkId, inputsCommitment, includedBlockId } = this.state;

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
                                        {transactionId}
                                    </span>
                                    <CopyButton
                                        onClick={() => ClipboardHelper.copy(
                                            transactionId
                                        )}
                                        buttonType="copy"
                                    />
                                </div>
                            </div>
                            {includedBlockId && (
                                <div className="section--data">
                                    <div className="label">
                                        Included in block
                                    </div>
                                    <div className="value code row middle">
                                        <span className="margin-r-t">
                                            {includedBlockId}
                                        </span>
                                        <CopyButton
                                            onClick={() => ClipboardHelper.copy(
                                                includedBlockId
                                            )}
                                            buttonType="copy"
                                        />
                                    </div>
                                </div>
                            )}
                            {tangleNetworkId && (
                                <div className="section--data">
                                    <div className="label">
                                        Network ID
                                    </div>
                                    <div className="value code row middle">
                                        <span className="margin-r-t">
                                            {tangleNetworkId}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {inputsCommitment && (
                                <div className="section--data">
                                    <div className="label">
                                        Input commitment
                                    </div>
                                    <div className="value code row middle">
                                        <span className="margin-r-t">
                                            {inputsCommitment}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {block?.nonce && (
                                <div className="section--data">
                                    <div className="label">
                                        Nonce
                                    </div>
                                    <div className="value row middle">
                                        <span className="margin-r-t">{block?.nonce}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {inputs &&
                            outputs &&
                            transferTotal !== undefined &&
                            (
                                <div className="section">
                                    <TransactionPayload
                                        network={network}
                                        history={this.props.history}
                                        inputs={inputs}
                                        outputs={outputs}
                                        transferTotal={transferTotal}
                                    />
                                </div>
                            )}
                    </div>
                </div>
            </div >
        );
    }
}

export default TransactionPage;
