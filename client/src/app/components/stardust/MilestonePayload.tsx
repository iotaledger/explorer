import {
    blockIdFromMilestonePayload, IMilestonePayload, IProtocolParamsMilestoneOption, IReceiptMilestoneOption,
    PROTOCOL_PARAMETERS_MILESTONE_OPTION_TYPE, RECEIPT_MILESTONE_OPTION_TYPE
} from "@iota/iota.js-stardust";
import React, { ReactNode } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { DateHelper } from "../../../helpers/dateHelper";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import Modal from "../../components/Modal";
import DataToggle from "../DataToggle";
import ReceiptPayload from "../stardust/ReceiptPayload";
import milestoneMessage from "./../../../assets/modals/stardust/block/milestone-payload.json";
import { MilestonePayloadProps } from "./MilestonePayloadProps";
import { MilestonePayloadState } from "./MilestonePayloadState";
import MilestoneSignaturesSection from "./MilestoneSignaturesSection";
import "./MilestonePayload.scss";

/**
 * Component which will display a milestone payload.
 */
class MilestonePayload extends AsyncComponent<MilestonePayloadProps, MilestonePayloadState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: StardustTangleCacheService;

    /**
     * Check next milestone timer id.
     */
    private _checkNextMilestoneTimerId?: NodeJS.Timer;

    /**
     * Create a new instance of MilestonePayload.
     * @param props The props.
     */
    constructor(props: MilestonePayloadProps) {
        super(props);
        this._tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);
        this.state = {};
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
        await this.checkForAdjacentMilestones();
    }

    public async componentDidUpdate(prevProps: Readonly<MilestonePayloadProps>): Promise<void> {
        if (this.props.milestonePayload.previousMilestoneId !== prevProps.milestonePayload.previousMilestoneId) {
            await this.checkForAdjacentMilestones();
        }
    }

    public componentWillUnmount(): void {
        super.componentWillUnmount();
        if (this._checkNextMilestoneTimerId) {
            clearTimeout(this._checkNextMilestoneTimerId);
            this._checkNextMilestoneTimerId = undefined;
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { network, milestonePayload, history, advancedMode } = this.props;
        const {
            index, timestamp, previousMilestoneId, inclusionMerkleRoot,
            appliedMerkleRoot, metadata, options, signatures
        }: IMilestonePayload = milestonePayload;
        const { previousMsBlockId, nextMsBlockId } = this.state;

        let receiptMilestoneOption: IReceiptMilestoneOption | null = null;
        let protocolParamsMilestoneOption: IProtocolParamsMilestoneOption | null = null;

        if (options?.some((option => option.type === RECEIPT_MILESTONE_OPTION_TYPE))) {
            receiptMilestoneOption = options.find(
                option => option.type === RECEIPT_MILESTONE_OPTION_TYPE
            ) as IReceiptMilestoneOption;
        }

        if (options?.some((option => option.type === PROTOCOL_PARAMETERS_MILESTONE_OPTION_TYPE))) {
            protocolParamsMilestoneOption = options.find(
                option => option.type === PROTOCOL_PARAMETERS_MILESTONE_OPTION_TYPE
            ) as IProtocolParamsMilestoneOption;
        }

        return (
            <React.Fragment>
                <div className="section milestone-payload">
                    <div className="section--header row space-between">
                        <div className="row middle">
                            <h2>Milestone Payload</h2>
                            <Modal icon="info" data={milestoneMessage} />
                        </div>
                        {(previousMsBlockId || nextMsBlockId) && (
                            <div className="section--data row middle">
                                <button
                                    className="milestone-action margin-r-t"
                                    type="button"
                                    disabled={!previousMsBlockId}
                                    onClick={() => history?.push(`/${network}/block/${previousMsBlockId}`)}
                                >
                                    <span>Previous</span>
                                </button>
                                <button
                                    className="milestone-action margin-r-t"
                                    type="button"
                                    disabled={!nextMsBlockId}
                                    onClick={() => history?.push(`/${network}/block/${nextMsBlockId}`)}
                                >
                                    <span>Next</span>
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="section--data">
                        <div className="label">Index</div>
                        <div className="value">{index}</div>
                    </div>
                    <div className="section--data">
                        <div className="label">Date</div>
                        <div className="value">
                            {timestamp && DateHelper.format(
                                DateHelper.milliseconds(
                                    timestamp
                                )
                            )}
                        </div>
                    </div>
                    <div className="section--data">
                        <div className="label">Previous milestone Id</div>
                        <div className="value">{previousMilestoneId}</div>
                    </div>
                    {advancedMode && (
                        <React.Fragment>
                            <div className="section--data">
                                <div className="label">Inclusion Merkle Root</div>
                                <div className="value code">{inclusionMerkleRoot}</div>
                            </div>
                            <div className="section--data">
                                <div className="label">Applied Merkle Root</div>
                                <div className="value code">{appliedMerkleRoot}</div>
                            </div>
                            {metadata && (
                                <div className="section--data">
                                    <div className="label">Metadata</div>
                                    <div className="value">
                                        <DataToggle sourceData={metadata} withSpacedHex={true} />
                                    </div>
                                </div>
                            )}
                            {protocolParamsMilestoneOption && (
                                <React.Fragment>
                                    <div className="section--data">
                                        <div className="label">Target milestone index</div>
                                        <div className="value code">
                                            {protocolParamsMilestoneOption?.targetMilestoneIndex}
                                        </div>
                                    </div>
                                    <div className="section--data">
                                        <div className="label">Target protocol version</div>
                                        <div className="value code">
                                            {protocolParamsMilestoneOption?.protocolVersion}
                                        </div>
                                    </div>
                                    <div className="section--data">
                                        <div className="label">Protocol paramaters</div>
                                        <div className="value code">
                                            {protocolParamsMilestoneOption?.params}
                                        </div>
                                    </div>
                                </React.Fragment>
                            )}
                            {receiptMilestoneOption && (
                                <div className="section">
                                    <ReceiptPayload
                                        network={network}
                                        history={history}
                                        payload={receiptMilestoneOption}
                                        advancedMode={advancedMode}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    )}
                </div>
                <MilestoneSignaturesSection signatures={signatures} />
            </React.Fragment>
        );
    }

    /**
     * Check for the previous and next milestones.
     */
    private async checkForAdjacentMilestones(): Promise<void> {
        const milestone = this.props.milestonePayload;
        if (milestone) {
            const { network, protocolVersion } = this.props;
            const nextIndex = milestone.index + 1;
            const previousIndex = milestone.index - 1;
            let previousMsBlockId: string | undefined;
            let nextMsBlockId: string | undefined;

            if (previousIndex > 0) {
                const resultPrevious = await this._tangleCacheService.milestoneDetails(network, previousIndex);
                if (resultPrevious.milestone) {
                    previousMsBlockId = blockIdFromMilestonePayload(protocolVersion, resultPrevious.milestone);
                }
            }

            const resultNext = await this._tangleCacheService.milestoneDetails(network, nextIndex);

            if (resultNext.milestone) {
                nextMsBlockId = blockIdFromMilestonePayload(protocolVersion, resultNext.milestone);
            }

            this.setState({
                previousMsBlockId,
                nextMsBlockId
            });

            if (!nextMsBlockId) {
                this._checkNextMilestoneTimerId = setTimeout(async () => this.checkForAdjacentMilestones(), 5000);
            }
        }
    }
}

export default MilestonePayload;

