/* eslint-disable max-len */
/* eslint-disable react/jsx-no-useless-fragment */
import { TRANSACTION_PAYLOAD_TYPE, TransactionHelper } from "@iota/iota.js-stardust";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import metadataInfo from "../../../assets/modals/stardust/block/metadata.json";
import transactionPayloadMessage from "../../../assets/modals/stardust/transaction/main-header.json";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { isMarketedNetwork } from "../../../helpers/networkHelper";
import { AsyncState } from "../../../helpers/promise/AsyncState";
import PromiseMonitor, { PromiseStatus } from "../../../helpers/promise/promiseMonitor";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { STARDUST } from "../../../models/config/protocolVersion";
import { calculateConflictReason, calculateStatus } from "../../../models/tangleStatus";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import FiatValue from "../../components/FiatValue";
import TabbedSection from "../../components/hoc/TabbedSection";
import Modal from "../../components/Modal";
import NotFound from "../../components/NotFound";
import Spinner from "../../components/Spinner";
import BlockTangleState from "../../components/stardust/block/BlockTangleState";
import TransactionPayload from "../../components/stardust/block/payload/TransactionPayload";
import InclusionState from "../../components/stardust/InclusionState";
import TruncatedId from "../../components/stardust/TruncatedId";
import NetworkContext from "../../context/NetworkContext";
import { TransactionsHelper } from "./../../../helpers/stardust/transactionsHelper";
import { TransactionPageProps } from "./TransactionPageProps";
import { TransactionPageState } from "./TransactionPageState";
import "./TransactionPage.scss";

type State = TransactionPageState & AsyncState;

enum TRANSACTION_PAGE_TABS {
    Payload = "Payload",
    BlockMetadata = "Block Metadata"
}

/**
 * Component which will show the Transaction page for stardust.
 */
class TransactionPage extends AsyncComponent<RouteComponentProps<TransactionPageProps>, State> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * The component context.
     */
    public declare context: React.ContextType<typeof NetworkContext>;

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
            blockTangleStatus: "pending",
            jobToStatus: new Map<string, PromiseStatus>(),
            isFormattedBalance: true
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
        // eslint-disable-next-line no-void
        void this.loadBlockFromTxId();
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
        const { network, transactionId } = this.props.match.params;
        const {
            inputs, unlocks, outputs, transferTotal, block, blockError,
            tangleNetworkId, inputsCommitment, includedBlockId,
            blockTangleStatus, metadata, metadataError, conflictReason, jobToStatus, isFormattedBalance
        } = this.state;
        const isLoading = Array.from(jobToStatus.values()).some(status => status !== PromiseStatus.DONE);
        const isMarketed = isMarketedNetwork(network);

        if (blockError) {
            return (
                <div className="transaction-page">
                    <div className="wrapper">
                        <div className="inner">
                            <div className="transaction-page--header">
                                <div className="row middle">
                                    <h1>
                                        Transaction
                                    </h1>
                                    <Modal icon="info" data={transactionPayloadMessage} />
                                    {isLoading && <Spinner />}
                                </div>
                                <NotFound
                                    searchTarget="transaction"
                                    query={transactionId}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        const transactionContent = !block ? null : (
            <React.Fragment>
                <div className="section--header row row--tablet-responsive middle space-between">
                    <div className="row middle">
                        <h2>General</h2>
                    </div>
                </div>
                <div className="section--data">
                    <div className="label">
                        Transaction ID
                    </div>
                    <div className="value code">
                        <TruncatedId
                            id={transactionId}
                            showCopyButton
                        />
                    </div>
                </div>
                {includedBlockId && (
                    <div className="section--data">
                        <div className="label">
                            Included in block
                        </div>
                        <div className="value code highlight">
                            <TruncatedId
                                id={includedBlockId}
                                link={`/${network}/block/${includedBlockId}`}
                                showCopyButton
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
                            <TruncatedId id={inputsCommitment} showCopyButton />
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
                {transferTotal !== undefined && (
                    <div className="section--data">
                        <div className="label">
                            Amount transacted
                        </div>
                        <div className="amount-transacted value row middle">
                            <span
                                onClick={() => this.setState({ isFormattedBalance: !isFormattedBalance })}
                                className="pointer margin-r-5"
                            >
                                {formatAmount(
                                    transferTotal,
                                    this.context.tokenInfo,
                                    !isFormattedBalance
                                )}
                            </span>
                            {isMarketed && (
                                <React.Fragment>
                                    <span>(</span>
                                    <FiatValue value={transferTotal} />
                                    <span>)</span>
                                </React.Fragment>
                            )}
                        </div>
                    </div>
                )}
                <TabbedSection
                    tabsEnum={TRANSACTION_PAGE_TABS}
                    tabOptions={{
                        [TRANSACTION_PAGE_TABS.Payload]: {
                            disabled: !inputs || !unlocks || !outputs || transferTotal === undefined,
                            isLoading: jobToStatus.get("loadBlock") !== PromiseStatus.DONE,
                            infoContent: transactionPayloadMessage
                        },
                        [TRANSACTION_PAGE_TABS.BlockMetadata]: {
                            isLoading: !metadata && !metadataError,
                            infoContent: metadataInfo
                        }
                    }}
                >
                    {inputs &&
                        unlocks &&
                        outputs &&
                        transferTotal !== undefined ?
                        (
                            <div className="section">
                                <TransactionPayload
                                    network={network}
                                    inputs={inputs}
                                    unlocks={unlocks}
                                    outputs={outputs}
                                />
                            </div>
                        ) : <></>}
                    <div className="section metadata-section">
                        <div className="section--data">
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
                                            Inclusion Status
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
                                                    <TruncatedId
                                                        id={parent}
                                                        link={`/${network}/block/${parent}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </React.Fragment>
                            )}
                        </div>
                    </div>
                </TabbedSection>
            </React.Fragment>
        );

        return (
            <div className="transaction-page">
                <div className="wrapper">
                    <div className="inner">
                        <div className="transaction-page--header">
                            <div className="row row--tablet-responsive middle space-between middle">
                                <div className="row middle">
                                    <h1>
                                        Transaction
                                    </h1>
                                    <Modal icon="info" data={transactionPayloadMessage} />
                                    {isLoading && <Spinner />}
                                </div>
                                <BlockTangleState
                                    network={network}
                                    status={blockTangleStatus}
                                    milestoneIndex={metadata?.referencedByMilestoneIndex}
                                    hasConflicts={metadata?.ledgerInclusionState === "conflicting"}
                                    onClick={metadata?.referencedByMilestoneIndex
                                        ? (blockId: string) => this.props.history.push(`/${network}/block/${blockId}`)
                                        : undefined}
                                />
                            </div>
                        </div>
                        <div className="section">{transactionContent}</div>
                    </div>
                </div>
            </div >
        );
    }

    /**
     * Load the block with the given id.
     */
    private async loadBlockFromTxId(): Promise<void> {
        const { network, transactionId } = this.props.match.params;
        const blockLoadMonitor = new PromiseMonitor(status => {
            this.setState(prevState => ({
                ...prevState,
                jobToStatus: this.state.jobToStatus.set("loadBlock", status)
            }));
        });

        // eslint-disable-next-line no-void
        void blockLoadMonitor.enqueue(
            async () => this._tangleCacheService.transactionIncludedBlockDetails(
                network, transactionId
            ).then(
                async response => {
                    if (response.block?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
                        const { inputs, unlocks, outputs, transferTotal } =
                            await TransactionsHelper.getInputsAndOutputs(
                                response.block,
                                network,
                                this.context.bech32Hrp,
                                this._tangleCacheService
                            );

                        const includedBlockId = TransactionHelper.calculateBlockId(response.block);

                        this.setState({
                            inputs,
                            unlocks,
                            outputs,
                            transferTotal,
                            block: response.block,
                            tangleNetworkId: response.block.payload.essence.networkId,
                            inputsCommitment: response.block.payload.essence.inputsCommitment,
                            includedBlockId
                        });

                        await this.updateInclusionState(network, includedBlockId);
                    } else {
                        this.setState({ blockError: response.error ?? "Couldn't load transaction block" });
                    }
                }
            )
        );
    }

    /**
     * Update inclusion state
     * @param network The network in context
     * @param blockId The block id to search
     */
    private async updateInclusionState(network: string, blockId: string): Promise<void> {
        const blockDetailsLoadMonitor = new PromiseMonitor(status => {
            this.setState(prevState => ({
                ...prevState,
                jobToStatus: this.state.jobToStatus.set("loadBlockDetails", status)
            }));
        });

        // eslint-disable-next-line no-void
        void blockDetailsLoadMonitor.enqueue(
            async () => this._tangleCacheService.blockDetails(network, blockId).then(
                details => {
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
            )
        );
    }
}

export default TransactionPage;

