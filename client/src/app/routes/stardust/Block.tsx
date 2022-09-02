/* eslint-disable @typescript-eslint/no-shadow */
import {
    MILESTONE_PAYLOAD_TYPE, TRANSACTION_PAYLOAD_TYPE, TAGGED_DATA_PAYLOAD_TYPE, INodeInfoBaseToken
} from "@iota/iota.js-stardust";
import React, { ReactNode } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { isMarketedNetwork } from "../../../helpers/networkHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { STARDUST } from "../../../models/config/protocolVersion";
import { calculateConflictReason, calculateStatus } from "../../../models/tangleStatus";
import { SettingsService } from "../../../services/settingsService";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import CopyButton from "../../components/CopyButton";
import FiatValue from "../../components/FiatValue";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import BlockTangleState from "../../components/stardust/BlockTangleState";
import InclusionState from "../../components/stardust/InclusionState";
import MilestonePayload from "../../components/stardust/MilestonePayload";
import TaggedDataPayload from "../../components/stardust/TaggedDataPayload";
import TransactionPayload from "../../components/stardust/TransactionPayload";
import Switcher from "../../components/Switcher";
import NetworkContext from "../../context/NetworkContext";
import mainHeaderMessage from "./../../../assets/modals/block/main-header.json";
import metadataMessage from "./../../../assets/modals/block/metadata.json";
import { TransactionsHelper } from "./../../../helpers/stardust/transactionsHelper";
import { BlockProps } from "./BlockProps";
import "./Block.scss";
import { BlockState } from "./BlockState";

/**
 * Component which will show the block page for stardust.
 */
class Block extends AsyncComponent<RouteComponentProps<BlockProps>, BlockState> {
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
            isFormattedBalance: true
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
        const blockId = this.props.match.params.blockId;
        const tokenInfo: INodeInfoBaseToken = this.context.tokenInfo;
        const isMarketed = isMarketedNetwork(network);

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
                            <Switcher
                                label="Advanced View"
                                checked={this.state.advancedMode}
                                onToggle={e => this.setState(
                                    {
                                        advancedMode: e.target.checked
                                    },
                                    () => this._settingsService.saveSingle(
                                        "advancedMode",
                                        this.state.advancedMode))}
                            />
                        </div>

                        <div className="section">
                            <div className="section--header row row--tablet-responsive middle space-between">
                                <div className="row middle">
                                    <h2>General</h2>
                                </div>

                                <BlockTangleState
                                    network={network}
                                    status={this.state.blockTangleStatus}
                                    milestoneIndex={this.state.metadata?.referencedByMilestoneIndex ??
                                        this.state.metadata?.milestoneIndex}
                                    hasConflicts={this.state.metadata?.ledgerInclusionState === "conflicting"}
                                    conflictReason={this.state.conflictReason}
                                    onClick={this.state.metadata?.referencedByMilestoneIndex
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

                            {this.state.transactionId && (
                                <div className="section--data">
                                    <div className="label">
                                        Transaction Id
                                    </div>
                                    <div className="value value__secondary row middle link">
                                        <Link
                                            to={`/${network}/transaction/${this.state.transactionId}`}
                                            className="margin-r-t"
                                        >
                                            {this.state.transactionId}
                                        </Link>
                                        <CopyButton copy={this.state.transactionId} />
                                    </div>
                                </div>
                            )}
                            <div className="section--data">
                                <div className="label">
                                    Payload Type
                                </div>
                                <div className="value row middle">
                                    {this.state.block?.payload?.type === TRANSACTION_PAYLOAD_TYPE &&
                                        ("Transaction")}
                                    {this.state.block?.payload?.type === MILESTONE_PAYLOAD_TYPE &&
                                        ("Milestone")}
                                    {this.state.block?.payload?.type === TAGGED_DATA_PAYLOAD_TYPE &&
                                        ("Data")}
                                    {this.state.block?.payload?.type === undefined &&
                                        ("No Payload")}
                                </div>
                            </div>
                            {this.state.advancedMode && (
                                <div className="section--data">
                                    <div className="label">
                                        Nonce
                                    </div>
                                    <div className="value row middle">
                                        <span className="margin-r-t">{this.state.block?.nonce}</span>
                                    </div>
                                </div>
                            )}
                            {this.state.block?.payload?.type === TRANSACTION_PAYLOAD_TYPE &&
                                this.state.transferTotal !== undefined && (
                                    <div className="section--data">
                                        <div className="label">
                                            Value
                                        </div>
                                        <div className="value row middle">
                                            <span
                                                onClick={() => this.setState({
                                                    isFormattedBalance: !this.state.isFormattedBalance
                                                })}
                                                className="pointer margin-r-5"
                                            >
                                                {formatAmount(
                                                    this.state.transferTotal,
                                                    tokenInfo,
                                                    !this.state.isFormattedBalance
                                                )}
                                            </span>
                                            {isMarketed && (
                                                (<FiatValue value={this.state.transferTotal} />)
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>


                        {this.state.block?.payload && (
                            <React.Fragment>
                                {this.state.block.payload.type === TRANSACTION_PAYLOAD_TYPE &&
                                    this.state.inputs &&
                                    this.state.unlocks &&
                                    this.state.outputs &&
                                    this.state.transferTotal !== undefined &&
                                    (
                                        <React.Fragment>
                                            <div className="section">
                                                <TransactionPayload
                                                    network={network}
                                                    inputs={this.state.inputs}
                                                    unlocks={this.state.unlocks}
                                                    outputs={this.state.outputs}
                                                    transferTotal={this.state.transferTotal}
                                                    header="Transaction Payload"
                                                />
                                            </div>
                                            {
                                                this.state.block.payload.essence.payload &&
                                                    <div className="section">
                                                        <TaggedDataPayload
                                                            network={network}
                                                            history={this.props.history}
                                                            payload={this.state.block.payload.essence.payload}
                                                            advancedMode={this.state.advancedMode}
                                                        />
                                                    </div>
                                            }
                                        </React.Fragment>
                                    )}
                                {this.state.block.payload.type === MILESTONE_PAYLOAD_TYPE && (
                                    <div className="section">
                                        <MilestonePayload
                                            network={network}
                                            history={this.props.history}
                                            payload={this.state.block.payload}
                                            advancedMode={this.state.advancedMode}
                                        />
                                    </div>
                                )}
                                {this.state.block.payload.type === TAGGED_DATA_PAYLOAD_TYPE && (
                                    <div className="section">
                                        <TaggedDataPayload
                                            network={network}
                                            history={this.props.history}
                                            payload={this.state.block.payload}
                                            advancedMode={this.state.advancedMode}
                                        />
                                    </div>
                                )}
                            </React.Fragment>
                        )}
                        {this.state.advancedMode && (
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
                                    {!this.state.metadata && !this.state.metadataError && (
                                        <Spinner />
                                    )}
                                    {this.state.metadataError && (
                                        <p className="danger">
                                            Failed to retrieve metadata. {this.state.metadataError}
                                        </p>
                                    )}
                                    {this.state.metadata && !this.state.metadataError && (
                                        <React.Fragment>
                                            <div className="section--data">
                                                <div className="label">
                                                    Is Solid
                                                </div>
                                                <div className="value row middle">
                                                    <span className="margin-r-t">
                                                        {this.state.metadata?.isSolid ? "Yes" : "No"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="section--data">
                                                <div className="label">
                                                    Ledger Inclusion
                                                </div>
                                                <div className="value row middle">
                                                    <InclusionState
                                                        state={this.state.metadata?.ledgerInclusionState}
                                                    />
                                                </div>
                                            </div>
                                            {this.state.conflictReason && (
                                                <div className="section--data">
                                                    <div className="label">
                                                        Conflict Reason
                                                    </div>
                                                    <div className="value">
                                                        {this.state.conflictReason}
                                                    </div>
                                                </div>
                                            )}
                                            {this.state.metadata?.parents &&
                                                this.state.block?.payload?.type !== MILESTONE_PAYLOAD_TYPE && (
                                                <div className="section--data">
                                                    <div className="label">
                                                        Parents
                                                    </div>
                                                    {this.state.metadata.parents.map((parent, idx) => (
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
                        )}
                    </div>
                </div>
            </div >
        );
    }

    /**
     * Update the block details.
     */
    private async updateBlockDetails(): Promise<void> {
        const details = await this._tangleCacheService.blockDetails(
            this.props.match.params.network, this.props.match.params.blockId
        );

        this.setState({
            metadata: details?.metadata,
            metadataError: details?.error,
            conflictReason: calculateConflictReason(details?.metadata),
            blockTangleStatus: calculateStatus(details?.metadata)
        });

        if (!details?.metadata?.referencedByMilestoneIndex) {
            this._timerId = setTimeout(async () => {
                await this.updateBlockDetails();
            }, 10000);
        }
    }

    /**
     * Load the block with the given id.
     * @param blockId The index to load.
     */
    private async loadBlock(blockId: string): Promise<void> {
        const result = await this._tangleCacheService.search(
            this.props.match.params.network, blockId
        );

        if (result?.block) {
            const { inputs, unlocks, outputs, unlockAddresses, transferTotal } =
                await TransactionsHelper.getInputsAndOutputs(
                    result?.block,
                    this.props.match.params.network,
                    this.context.bech32Hrp,
                    this._tangleCacheService
            );

            if (result?.block?.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
                const transactionId = TransactionsHelper.computeTransactionIdFromTransactionPayload(
                    result?.block.payload
                );
                this.setState({ transactionId });
            }

            this.setState({
                inputs,
                unlocks,
                outputs,
                unlockAddresses,
                transferTotal
            });

            this.setState({
                block: result.block
            }, async () => {
                await this.updateBlockDetails();
            });
        } else {
            this.props.history.replace(`/${this.props.match.params.network
                }/search/${blockId}`);
        }
    }
}

export default Block;

