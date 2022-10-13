/* eslint-disable @typescript-eslint/no-shadow */
import {
    MILESTONE_PAYLOAD_TYPE, TRANSACTION_PAYLOAD_TYPE, TAGGED_DATA_PAYLOAD_TYPE,
    INodeInfoBaseToken, milestoneIdFromMilestonePayload
} from "@iota/iota.js-stardust";
import { HexHelper } from "@iota/util.js-stardust";
import React, { ReactNode } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { isMarketedNetwork } from "../../../helpers/networkHelper";
import { AsyncState } from "../../../helpers/promise/AsyncState";
import PromiseMonitor, { PromiseStatus } from "../../../helpers/promise/promiseMonitor";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { STARDUST } from "../../../models/config/protocolVersion";
import { calculateConflictReason, calculateStatus } from "../../../models/tangleStatus";
import { SettingsService } from "../../../services/settingsService";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import CopyButton from "../../components/CopyButton";
import FiatValue from "../../components/FiatValue";
import Modal from "../../components/Modal";
import NotFound from "../../components/NotFound";
import Spinner from "../../components/Spinner";
import BlockTangleState from "../../components/stardust/BlockTangleState";
import InclusionState from "../../components/stardust/InclusionState";
import MilestonePayload from "../../components/stardust/MilestonePayload";
import TaggedDataPayload from "../../components/stardust/TaggedDataPayload";
import TransactionPayload from "../../components/stardust/TransactionPayload";
import Switcher from "../../components/Switcher";
import NetworkContext from "../../context/NetworkContext";
import mainHeaderMessage from "./../../../assets/modals/stardust/block/main-header.json";
import metadataMessage from "./../../../assets/modals/stardust/block/metadata.json";
import { TransactionsHelper } from "./../../../helpers/stardust/transactionsHelper";
import { BlockProps } from "./BlockProps";
import { BlockState } from "./BlockState";
import "./Block.scss";

type State = BlockState & AsyncState;

/**
 * Component which will show the block page for stardust.
 */
class Block extends AsyncComponent<RouteComponentProps<BlockProps>, State> {
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
     * Settings service.
     */
    private readonly _settingsService: SettingsService;

    /**
     * Timer to check to state update.
     */
    private _timerId?: NodeJS.Timer;

    /**
     * Create a new instance of Block.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<BlockProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(
            `tangle-cache-${STARDUST}`
        );
        this._settingsService = ServiceFactory.get<SettingsService>("settings");

        this.state = {
            blockTangleStatus: "pending",
            advancedMode: this._settingsService.get().advancedMode ?? false,
            isFormattedBalance: true,
            jobToStatus: new Map<string, PromiseStatus>()
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
        await this.loadBlock(this.props.match.params.blockId);
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
        const blockId = HexHelper.addPrefix(this.props.match.params.blockId);
        const {
            transactionId, block, blockError, metadata, metadataError, conflictReason, blockTangleStatus,
            advancedMode, inputs, unlocks, outputs, transferTotal, isFormattedBalance, jobToStatus
        } = this.state;
        const tokenInfo: INodeInfoBaseToken = this.context.tokenInfo;
        const isMarketed = isMarketedNetwork(network);
        const isLinksDisabled = metadata?.ledgerInclusionState === "conflicting";
        const isLoading = Array.from(jobToStatus.values()).some(status => status !== PromiseStatus.DONE);
        const milestoneId = block?.payload?.type === MILESTONE_PAYLOAD_TYPE ?
            milestoneIdFromMilestonePayload(block.payload) : undefined;

        if (blockError) {
            return (
                <div className="block">
                    <div className="wrapper">
                        <div className="inner">
                            <div className="block--header">
                                <div className="row middle">
                                    <h1>
                                        Block
                                    </h1>
                                    <Modal icon="info" data={mainHeaderMessage} />
                                </div>
                            </div>
                            <NotFound
                                searchTarget="block"
                                query={this.props.match.params.blockId}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        const blockContent = !block ? null : (
            <React.Fragment>
                <div className="section--header row row--tablet-responsive middle space-between">
                    <div className="row middle">
                        <h2>General</h2>
                    </div>
                    <BlockTangleState
                        network={network}
                        status={blockTangleStatus}
                        milestoneIndex={metadata?.referencedByMilestoneIndex ?? metadata?.milestoneIndex}
                        hasConflicts={isLinksDisabled}
                        conflictReason={conflictReason}
                        onClick={metadata?.referencedByMilestoneIndex
                            ? (blockId: string) => this.props.history.push(`/${network}/search/${blockId}`)
                            : undefined}
                    />
                </div>
                <div className="section--data">
                    <div className="label">
                        Block ID
                    </div>
                    <div className="value code row middle">
                        <span className="margin-r-t">
                            {blockId}
                        </span>
                        <CopyButton copy={blockId} />
                    </div>
                </div>
                {milestoneId && (
                    <div className="section--data">
                        <div className="label">
                            Milestone ID
                        </div>
                        <div className="value code row middle">
                            <span className="margin-r-t">
                                {milestoneId}
                            </span>
                            <CopyButton copy={milestoneId} />
                        </div>
                    </div>
                )}
                {transactionId && (
                    <div className="section--data">
                        <div className="label">
                            Transaction Id
                        </div>
                        <div className="value value__secondary row middle link">
                            {isLinksDisabled ?
                                <span className="margin-r-t">
                                    {transactionId}
                                </span> :
                                <Link
                                    to={`/${network}/transaction/${transactionId}`}
                                    className="margin-r-t"
                                >
                                    {transactionId}
                                </Link>}
                            <CopyButton copy={transactionId} />
                        </div>
                    </div>
                )}
                <div className="section--data">
                    <div className="label">
                        Payload Type
                    </div>
                    <div className="value row middle">
                        {block?.payload?.type === TRANSACTION_PAYLOAD_TYPE &&
                            ("Transaction")}
                        {block?.payload?.type === MILESTONE_PAYLOAD_TYPE &&
                            ("Milestone")}
                        {block?.payload?.type === TAGGED_DATA_PAYLOAD_TYPE &&
                            ("Data")}
                        {block?.payload?.type === undefined &&
                            ("No Payload")}
                    </div>
                </div>
                {advancedMode && (
                    <div className="section--data">
                        <div className="label">
                            Nonce
                        </div>
                        <div className="value row middle">
                            <span className="margin-r-t">{block?.nonce}</span>
                        </div>
                    </div>
                )}
                {block?.payload?.type === TRANSACTION_PAYLOAD_TYPE &&
                    transferTotal !== undefined && (
                        <div className="section--data">
                            <div className="label">
                                Value
                            </div>
                            <div className="value row middle">
                                <span
                                    onClick={() => this.setState({
                                        isFormattedBalance: !isFormattedBalance
                                    })}
                                    className="pointer margin-r-5"
                                >
                                    {formatAmount(
                                        transferTotal,
                                        tokenInfo,
                                        !isFormattedBalance
                                    )}
                                </span>
                                {isMarketed && (
                                    (<FiatValue value={transferTotal} />)
                                )}
                            </div>
                        </div>
                    )}
                {block?.payload && (
                    <React.Fragment>
                        {block.payload.type === TRANSACTION_PAYLOAD_TYPE &&
                            inputs && unlocks && outputs && transferTotal !== undefined && (
                                <React.Fragment>
                                    <div className="section">
                                        <TransactionPayload
                                            network={network}
                                            inputs={inputs}
                                            unlocks={unlocks}
                                            outputs={outputs}
                                            transferTotal={transferTotal}
                                            header="Transaction Payload"
                                            isLinksDisabled={isLinksDisabled}
                                        />
                                    </div>
                                    {
                                        block.payload.essence.payload &&
                                        <div className="section">
                                            <TaggedDataPayload
                                                network={network}
                                                history={this.props.history}
                                                payload={block.payload.essence.payload}
                                                advancedMode={advancedMode}
                                            />
                                        </div>
                                    }
                                </React.Fragment>
                            )}
                        {block.payload.type === MILESTONE_PAYLOAD_TYPE && (
                            <div className="section">
                                <MilestonePayload
                                    network={network}
                                    history={this.props.history}
                                    payload={block.payload}
                                    advancedMode={advancedMode}
                                />
                            </div>
                        )}
                        {block.payload.type === TAGGED_DATA_PAYLOAD_TYPE && (
                            <div className="section">
                                <TaggedDataPayload
                                    network={network}
                                    history={this.props.history}
                                    payload={block.payload}
                                    advancedMode={advancedMode}
                                />
                            </div>
                        )}
                    </React.Fragment>
                )}
                {advancedMode && (
                    <div className="section metadata-section">
                        <div className="section--header section--header__space-between">
                            <div className="row middle">
                                <h2>
                                    Metadata
                                </h2>
                                <Modal icon="info" data={metadataMessage} />
                            </div>
                        </div>
                        <div className="section--data">
                            {!metadata && !metadataError && (<Spinner />)}
                            {metadataError && (
                                <p className="danger">Failed to retrieve metadata. {metadataError}</p>
                            )}
                            {metadata && !metadataError && (
                                <React.Fragment>
                                    <div className="section--data">
                                        <div className="label">Is Solid</div>
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
                                            <InclusionState state={metadata?.ledgerInclusionState} />
                                        </div>
                                    </div>
                                    {conflictReason && (
                                        <div className="section--data">
                                            <div className="label">Conflict Reason</div>
                                            <div className="value">{conflictReason}</div>
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
                                                    {isLinksDisabled ? (
                                                        <span className="margin-r-t">
                                                            {parent}
                                                        </span>
                                                    ) : (
                                                        <div
                                                            className="pointer"
                                                            onClick={() => this.props.history.replace(
                                                                `/${network}/search/${parent}`
                                                            )}
                                                        >
                                                            {parent}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </React.Fragment>
                            )}
                        </div>
                    </div>
                )}
            </React.Fragment>
        );

        return (
            <div className="block">
                <div className="wrapper">
                    <div className="inner">
                        <div className="block--header">
                            <div className="row middle">
                                <h1>
                                    Block
                                </h1>
                                <Modal icon="info" data={mainHeaderMessage} />
                                {isLoading && <Spinner />}
                            </div>
                            <Switcher
                                label="Advanced View"
                                checked={advancedMode}
                                onToggle={
                                    e => this.setState(
                                        { advancedMode: e.target.checked },
                                        () => this._settingsService.saveSingle("advancedMode", e.target.checked)
                                    )
                                }
                            />
                        </div>
                        <div className="section">{blockContent}</div>
                    </div>
                </div>
            </div >
        );
    }

    /**
     * Update the block details.
     */
    private async updateBlockDetails(): Promise<void> {
        const { network, blockId } = this.props.match.params;
        const blockDetailsLoadMonitor = new PromiseMonitor(status => {
            this.setState(
                prevState => (
                    { ...prevState, jobToStatus: prevState.jobToStatus.set("loadBlockDetails", status) }
                )
            );
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

                    // requeue job until block is referenced
                    if (!details?.metadata?.referencedByMilestoneIndex) {
                        this._timerId = setTimeout(async () => {
                            await this.updateBlockDetails();
                        }, 10000);
                    }
                }
            )
        );
    }

    /**
     * Load the block with the given id.
     * @param blockId The index to load.
     */
    private async loadBlock(blockId: string): Promise<void> {
        const network = this.props.match.params.network;
        const blockLoadMonitor = new PromiseMonitor(status => {
            this.setState(
                prevState => (
                    { ...prevState, jobToStatus: prevState.jobToStatus.set("loadBlock", status) }
                )
            );
        });

        // eslint-disable-next-line no-void
        void blockLoadMonitor.enqueue(
            async () => this._tangleCacheService.block(network, blockId).then(
                async response => {
                    if (response.block) {
                        let transactionId;
                        const block = response.block;
                        const { inputs, unlocks, outputs, transferTotal } =
                            await TransactionsHelper.getInputsAndOutputs(
                                block,
                                this.props.match.params.network,
                                this.context.bech32Hrp,
                                this._tangleCacheService
                            );

                        if (block.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
                            transactionId = TransactionsHelper.computeTransactionIdFromTransactionPayload(
                                block.payload
                            );
                        }

                        this.setState(
                            {
                                block,
                                inputs,
                                unlocks,
                                outputs,
                                transferTotal,
                                transactionId
                            },
                            async () => {
                                await this.updateBlockDetails();
                            }
                        );
                    } else {
                        this.setState({ blockError: response.error ?? "Couldn't load block" });
                    }
                }
            )
        );
    }
}

export default Block;

