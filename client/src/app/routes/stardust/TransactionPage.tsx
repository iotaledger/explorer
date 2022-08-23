/* eslint-disable max-len */
import { TRANSACTION_PAYLOAD_TYPE, TransactionHelper } from "@iota/iota.js-stardust";
import React, { ReactNode } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { STARDUST } from "../../../models/config/protocolVersion";
import { calculateConflictReason, calculateStatus } from "../../../models/tangleStatus";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import CopyButton from "../../components/CopyButton";
import Spinner from "../../components/Spinner";
import BlockTangleState from "../../components/stardust/BlockTangleState";
import InclusionState from "../../components/stardust/InclusionState";
import TransactionPayload from "../../components/stardust/TransactionPayload";
import NetworkContext from "../../context/NetworkContext";
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
     * Timer for inclusion state check.
     */
    private _timerId?: NodeJS.Timer;

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
            blockTangleStatus: "pending"
        };
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
            const { inputs, unlocks, outputs, transferTotal } =
            await TransactionsHelper.getInputsAndOutputs(
                block,
                this.props.match.params.network,
                this.context.bech32Hrp,
                this._tangleCacheService
            );

            const includedBlockId = TransactionHelper.calculateBlockId(block);

            this.setState({
                inputs,
                unlocks,
                outputs,
                transferTotal,
                block,
                tangleNetworkId: block.payload.essence.networkId,
                inputsCommitment: block.payload.essence.inputsCommitment,
                includedBlockId
            });

            await this.updateInclusionState(this.props.match.params.network, includedBlockId);
        } else {
            this.props.history.replace(`/${this.props.match.params.network}/search/${this.props.match.params.transactionId}`);
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
        const network = this.props.match.params.network;
        const transactionId = this.props.match.params.transactionId;
        const {
            inputs, unlocks, outputs, transferTotal, block,
            tangleNetworkId, inputsCommitment, includedBlockId,
            blockTangleStatus, metadata, metadataError, conflictReason
        } = this.state;

        return (
            <div className="transaction-page">
                <div className="wrapper">
                    <div className="inner">
                        <div className="transaction-page--header">
                            <div className="row row--tablet-responsive middle space-between middle">
                                <h1>
                                    Transaction
                                </h1>

                                <BlockTangleState
                                    network={network}
                                    status={blockTangleStatus}
                                    milestoneIndex={metadata?.referencedByMilestoneIndex ?? metadata?.milestoneIndex}
                                    hasConflicts={metadata?.ledgerInclusionState === "conflicting"}
                                    onClick={metadata?.referencedByMilestoneIndex
                                        ? (blockId: string) => this.props.history.push(`/${network}/search/${blockId}`)
                                        : undefined}
                                />
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
                                    <CopyButton copy={transactionId} />
                                </div>
                            </div>
                            {includedBlockId && (
                                <div className="section--data">
                                    <div className="label">
                                        Included in block
                                    </div>
                                    <div className="value code row middle">
                                        <span className="margin-r-t link">
                                            <Link
                                                to={`/${network}/block/${includedBlockId}`}
                                                className="margin-r-t"
                                            >
                                                {includedBlockId}
                                            </Link>
                                        </span>
                                        <CopyButton copy={includedBlockId} />
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
                            unlocks &&
                            outputs &&
                            transferTotal !== undefined &&
                            (
                                <div className="section">
                                    <TransactionPayload
                                        network={network}
                                        inputs={inputs}
                                        unlocks={unlocks}
                                        outputs={outputs}
                                        transferTotal={transferTotal}
                                        header="Content"
                                    />
                                </div>
                        )}
                        <div className="section metadata-section">
                            <div className="section--header section--header__space-between">
                                <div className="row middle">
                                    <h2>
                                        Block Metadata
                                    </h2>
                                </div>
                            </div>
                            <div className="section--data">
                                {!metadata && !metadataError && (
                                    <Spinner />
                                )}
                                {metadataError && (
                                    <p className="danger">
                                        Failed to retrieve metadata. {metadataError}
                                    </p>
                                )}
                                {metadata && !metadataError && (
                                    <React.Fragment>
                                        <div className="section--data">
                                            <div className="label">
                                                Is Solid
                                            </div>
                                            <div className="value row middle">
                                                <span className="margin-r-t">
                                                    {metadata?.isSolid ? "Yes" : "No"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="section--data">
                                            <div className="label">
                                                Ledger Inclusion
                                            </div>
                                            <div className="value row middle">
                                                <InclusionState
                                                    state={metadata?.ledgerInclusionState}
                                                />
                                            </div>
                                        </div>
                                        {conflictReason && (
                                            <div className="section--data">
                                                <div className="label">
                                                    Conflict Reason
                                                </div>
                                                <div className="value">
                                                    {conflictReason}
                                                </div>
                                            </div>
                                        )}
                                        {metadata?.parents && (
                                            <div className="section--data">
                                                <div className="label">
                                                    Parents
                                                </div>
                                                {metadata.parents.map((parent, idx) => (
                                                    <div
                                                        key={idx}
                                                        style={{ marginTop: "8px" }}
                                                        className="value code link"
                                                    >
                                                        <Link
                                                            to={`/${network}/block/${parent}`}
                                                            className="margin-r-t"
                                                        >
                                                            {parent}
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </React.Fragment>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        );
    }

    /**
     * Update inclusion state
     * @param network The network in context
     * @param blockId The block id to search
     */
    private async updateInclusionState(network: string, blockId: string): Promise<void> {
        const details = await this._tangleCacheService.blockDetails(network, blockId);

        this.setState({
            metadata: details?.metadata,
            metadataError: details?.error,
            conflictReason: calculateConflictReason(details?.metadata),
            blockTangleStatus: calculateStatus(details?.metadata)
        });

        if (!details?.metadata?.referencedByMilestoneIndex) {
            this._timerId = setTimeout(async () => {
                await this.updateInclusionState(network, blockId);
            }, 10000);
        }
    }
}

export default TransactionPage;
