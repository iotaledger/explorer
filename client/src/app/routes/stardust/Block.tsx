import {
    CONFLICT_REASON_STRINGS, IBlockMetadata, MILESTONE_PAYLOAD_TYPE,
    TRANSACTION_PAYLOAD_TYPE, TAGGED_DATA_PAYLOAD_TYPE
} from "@iota/iota.js-stardust";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { STARDUST } from "../../../models/db/protocolVersion";
import { TangleStatus } from "../../../models/tangleStatus";
import { SettingsService } from "../../../services/settingsService";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import CopyButton from "../../components/CopyButton";
import FiatValue from "../../components/FiatValue";
import InclusionState from "../../components/InclusionState";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import BlockTangleState from "../../components/stardust/BlockTangleState";
import BlockTree from "../../components/stardust/BlockTree";
import MilestonePayload from "../../components/stardust/MilestonePayload";
import TaggedDataPayload from "../../components/stardust/TaggedDataPayload";
import TransactionPayload from "../../components/stardust/TransactionPayload";
import Switcher from "../../components/Switcher";
import NetworkContext from "../../context/NetworkContext";
import mainHeaderMessage from "./../../../assets/modals/address/main-header.json";
import metadataMessage from "./../../../assets/modals/block/metadata.json";
import treeMessage from "./../../../assets/modals/block/tree.json";
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
            childrenBusy: true,
            advancedMode: this._settingsService.get().advancedMode ?? false
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
        await this.loadBlock(this.props.match.params.blockId, false);
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
                                    network={this.props.match.params.network}
                                    status={this.state.blockTangleStatus}
                                    milestoneIndex={this.state.metadata?.referencedByMilestoneIndex ??
                                        this.state.metadata?.milestoneIndex}
                                    hasConflicts={this.state.metadata?.ledgerInclusionState === "conflicting"}
                                    onClick={this.state.metadata?.referencedByMilestoneIndex
                                        ? (blockId: string) => this.props.history.push(
                                            `/${this.props.match.params.network
                                            }/search/${blockId}`)
                                        : undefined}
                                />
                            </div>
                            <div className="section--data">
                                <div className="label">
                                    Block ID
                                </div>
                                <div className="value code row middle">
                                    <span className="margin-r-t">
                                        {this.state.actualBlockId}
                                    </span>
                                    <CopyButton
                                        onClick={() => ClipboardHelper.copy(
                                            this.state.actualBlockId
                                        )}
                                        buttonType="copy"
                                    />
                                </div>
                            </div>

                            {this.state.transactionId && (
                                <div className="section--data">
                                    <div className="label">
                                        Transaction Id
                                    </div>
                                    <div className="value value__secondary row middle">
                                        <span className="margin-r-t">{this.state.transactionId}</span>
                                        <CopyButton
                                            onClick={() => ClipboardHelper.copy(
                                                this.state.transactionId
                                            )}
                                            buttonType="copy"
                                        />
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
                                            {
                                                formatAmount(
                                                    this.state.transferTotal,
                                                    this.context.tokenInfo
                                                )
                                            }
                                            {" "}
                                            (<FiatValue value={this.state.transferTotal} />)
                                        </div>
                                    </div>
                                )}
                        </div>


                        {this.state.block?.payload && (
                            <React.Fragment>
                                {this.state.block.payload.type === TRANSACTION_PAYLOAD_TYPE &&
                                    this.state.inputs &&
                                    this.state.outputs &&
                                    this.state.transferTotal !== undefined &&
                                    (
                                        <React.Fragment>
                                            <div className="section">
                                                <TransactionPayload
                                                    network={this.props.match.params.network}
                                                    history={this.props.history}
                                                    inputs={this.state.inputs}
                                                    outputs={this.state.outputs}
                                                    transferTotal={this.state.transferTotal}
                                                />
                                            </div>
                                            {
                                                this.state.block.payload.essence.payload &&
                                                    <div className="section">
                                                        <TaggedDataPayload
                                                            network={this.props.match.params.network}
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
                                            network={this.props.match.params.network}
                                            history={this.props.history}
                                            payload={this.state.block.payload}
                                            advancedMode={this.state.advancedMode}
                                        />
                                    </div>
                                )}
                                {this.state.block.payload.type === TAGGED_DATA_PAYLOAD_TYPE && (
                                    <div className="section">
                                        <TaggedDataPayload
                                            network={this.props.match.params.network}
                                            history={this.props.history}
                                            payload={this.state.block.payload}
                                            advancedMode={this.state.advancedMode}
                                        />
                                    </div>
                                )}
                            </React.Fragment>
                        )}
                        {this.state.advancedMode && (
                            <div className="section">
                                <div className="section--header section--header__space-between">
                                    <div className="row middle">
                                        <h2>
                                            Metadata
                                            <Modal icon="info" data={metadataMessage} />
                                        </h2>
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
                                        </React.Fragment>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="section">
                            <div className="section--header">
                                <div>
                                    <div className="row middle">
                                        <h2>
                                            Block tree
                                        </h2>
                                        <Modal icon="info" data={treeMessage} />
                                    </div>
                                </div>
                            </div>
                            {this.state.block?.parents && this.state.childrenIds && (
                                <BlockTree
                                    parentsIds={this.state.block?.parents}
                                    blockId={this.props.match.params.blockId}
                                    childrenIds={this.state.childrenIds}
                                    onSelected={async (i, update) => this.loadBlock(i, update)}
                                />
                            )}
                        </div>
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
            this.props.match.params.network, this.state.actualBlockId ?? "");

        this.setState({
            metadata: details?.metadata,
            metadataError: details?.error,
            conflictReason: this.calculateConflictReason(details?.metadata),
            childrenIds: details?.childrenIds && details?.childrenIds.length > 0
                ? details?.childrenIds : (this.state.childrenIds ?? []),
            blockTangleStatus: this.calculateStatus(details?.metadata),
            childrenBusy: false
        });

        if (!details?.metadata?.referencedByMilestoneIndex) {
            this._timerId = setTimeout(async () => {
                await this.updateBlockDetails();
            }, 10000);
        }
    }

    /**
     * Calculate the status for the block.
     * @param metadata The metadata to calculate the status from.
     * @returns The block status.
     */
    private calculateStatus(metadata?: IBlockMetadata): TangleStatus {
        let blockTangleStatus: TangleStatus = "unknown";

        if (metadata) {
            if (metadata.milestoneIndex) {
                blockTangleStatus = "milestone";
            } else if (metadata.referencedByMilestoneIndex) {
                blockTangleStatus = "referenced";
            } else {
                blockTangleStatus = "pending";
            }
        }

        return blockTangleStatus;
    }

    /**
     * Calculate the conflict reason for the block.
     * @param metadata The metadata to calculate the conflict reason from.
     * @returns The conflict reason.
     */
    private calculateConflictReason(metadata?: IBlockMetadata): string {
        let conflictReason: string = "";

        if (metadata?.ledgerInclusionState === "conflicting") {
            conflictReason = metadata.conflictReason && CONFLICT_REASON_STRINGS[metadata.conflictReason]
                ? CONFLICT_REASON_STRINGS[metadata.conflictReason]
                : "The reason for the conflict is unknown";
        }

        return conflictReason;
    }

    /**
     * Load the block with the given id.
     * @param blockId The index to load.
     * @param updateUrl Update the url.
     */
    private async loadBlock(blockId: string, updateUrl: boolean): Promise<void> {
        const result = await this._tangleCacheService.search(
            this.props.match.params.network, blockId
        );

        if (result?.block) {
            if (!updateUrl) {
                window.scrollTo({
                    left: 0,
                    top: 0,
                    behavior: "smooth"
                });
            }

            const { inputs, outputs, unlockAddresses, transferTotal } =
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
                outputs,
                unlockAddresses,
                transferTotal
            });

            this.setState({
                actualBlockId: result.includedBlockId ?? blockId,
                block: result.block
            }, async () => {
                await this.updateBlockDetails();
            });
            if (updateUrl) {
                window.history.pushState(undefined, window.document.title, `/${this.props.match.params.network
                    }/block/${result.includedBlockId ?? blockId}`);
            }
        } else {
            this.props.history.replace(`/${this.props.match.params.network
                }/search/${blockId}`);
        }
    }
}

export default Block;

