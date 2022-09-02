/* eslint-disable max-len */
import {
    IMilestonePayload, IProtocolParamsMilestoneOption, IReceiptMilestoneOption,
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
import milestoneMessage from "./../../../assets/modals/block/milestone-payload.json";
import "./MilestonePayload.scss";
import { MilestonePayloadProps } from "./MilestonePayloadProps";
import { MilestonePayloadState } from "./MilestonePayloadState";

/**
 * Component which will display a milestone payload.
 */
class MilestonePayload extends AsyncComponent<MilestonePayloadProps, MilestonePayloadState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: StardustTangleCacheService;

    /**
     * Create a new instance of MilestonePayload.
     * @param props The props.
     */
    constructor(props: MilestonePayloadProps) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);


        this.state = {
            nextIndex: -1,
            previousIndex: -1,
            hasPrevious: false,
            hasNext: false
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        await this.loadIndex(this.props.payload.index.toString(), false);
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { index, timestamp, previousMilestoneId,
            parents, inclusionMerkleRoot, appliedMerkleRoot,
            metadata, options, signatures }: IMilestonePayload = this.props.payload;

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
            <div className="milestone-payload">
                <div className="section--header row space-between">
                    <div className="row middle">
                        <h2>
                            Milestone Payload
                        </h2>
                        <Modal icon="info" data={milestoneMessage} />
                    </div>
                    {(this.state.hasPrevious || this.state.hasNext) && (
                        <div className="section--data row middle">
                            <button
                                disabled={!this.state.hasPrevious}
                                type="button"
                                onClick={async () =>
                                    this.loadIndex(this.state.previousIndex.toString(), true)}
                                className="milestone-action margin-r-t"
                            >
                                <span>Previous</span>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14 18L8 12L14 6" stroke="#293858" strokeWidth="2" strokeLinecap="round" />
                                </svg>

                            </button>
                            <button
                                disabled={!this.state.hasNext}
                                type="button"
                                onClick={async () =>
                                    this.loadIndex(this.state.nextIndex.toString(), true)}
                                className="milestone-action margin-r-t"
                            >
                                <span>Next</span>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 18L16 12L10 6" stroke="#293858" strokeWidth="2" strokeLinecap="round" />
                                </svg>

                            </button>
                        </div>
                    )}
                </div>
                <div className="section--data">
                    <div className="label">
                        Index
                    </div>
                    <div className="value">
                        {index}
                    </div>
                </div>
                <div className="section--data">
                    <div className="label">
                        Date
                    </div>
                    <div className="value">
                        {timestamp && DateHelper.format(
                            DateHelper.milliseconds(
                                timestamp
                            )
                        )}
                    </div>
                </div>
                <div className="section--data">
                    <div className="label">
                        Previous milestone Id
                    </div>
                    <div className="value">
                        {previousMilestoneId}
                    </div>
                </div>
                {parents?.length > 0 && (
                    <div className="section--data">
                        <div className="label">
                            Parent block Ids
                        </div>
                        {parents.map((id, idx) => (
                            <div key={idx} className="value code">
                                {id}
                            </div>
                        ))}
                    </div>
                )}
                {this.props.advancedMode && (
                    <React.Fragment>
                        <div className="section--data">
                            <div className="label">
                                Inclusion Merkle Root
                            </div>
                            <div className="value code">
                                {inclusionMerkleRoot}
                            </div>
                        </div>
                        <div className="section--data">
                            <div className="label">
                                Applied Merkle Root
                            </div>
                            <div className="value code">
                                {appliedMerkleRoot}
                            </div>
                        </div>
                        {metadata && (
                            <div className="section--data">
                                <div className="label">
                                    Metadata
                                </div>
                                <div className="value">
                                    <DataToggle
                                        sourceData={metadata}
                                        withSpacedHex={true}
                                    />
                                </div>
                            </div>
                        )}
                        {protocolParamsMilestoneOption && (
                            <React.Fragment>
                                <div className="section--data">
                                    <div className="label">
                                        Target milestone index
                                    </div>
                                    <div className="value code">
                                        {protocolParamsMilestoneOption?.targetMilestoneIndex}
                                    </div>
                                </div>
                                <div className="section--data">
                                    <div className="label">
                                        Target protocol version
                                    </div>
                                    <div className="value code">
                                        {protocolParamsMilestoneOption?.protocolVersion}
                                    </div>
                                </div>
                                <div className="section--data">
                                    <div className="label">
                                        Protocol paramaters
                                    </div>
                                    <div className="value code">
                                        {protocolParamsMilestoneOption?.params}
                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                        {receiptMilestoneOption && (
                            <div className="section">
                                <ReceiptPayload
                                    network={this.props.network}
                                    history={this.props.history}
                                    payload={receiptMilestoneOption}
                                    advancedMode={this.props.advancedMode}
                                />
                            </div>
                        )}
                        <div className="section--data" >
                            <div className="label">
                                Signatures
                            </div>
                            <div className="section--data margin-t-s">
                                {signatures.map((signature, idx) => (
                                    <div key={idx} className="margin-b-s">
                                        <div className="label indent">
                                            Public Key
                                        </div>
                                        <div className="value code indent">
                                            {signature.publicKey}
                                        </div>
                                        <div className="label indent margin-t-2">
                                            Signature
                                        </div>
                                        <div className="value code indent">
                                            {signature.signature}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </React.Fragment>
                )}
            </div>
        );
    }

    /**
     * Load the milestone with the given index.
     * @param index The index to load.
     * @param updateUrl Update the url.
     */
    private async loadIndex(index: string, updateUrl: boolean): Promise<void> {
        const result = await this._tangleCacheService.milestoneDetails(
            this.props.network, Number.parseInt(index, 10)
        );

        if (result) {
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: "smooth"
            });

            this.setState({
                blockId: result.blockId,
                milestoneId: result.milestoneId,
                milestone: result.milestone
            }, async () => this.checkForAdjacentMilestones());

            if (updateUrl) {
                window.location.href = `/${this.props.network}/block/${this.state.blockId}`;
            }
        } else {
            this.props.history.replace(`/${this.props.network}/search/${index}`);
        }
    }

    /**
     * Check for the previous and next milestones.
     */
    private async checkForAdjacentMilestones(): Promise<void> {
        if (this.state.milestone) {
            const nextIndex = this.state.milestone.index + 1;
            const previousIndex = this.state.milestone.index - 1;
            let hasNext = false;
            let hasPrevious = false;

            if (previousIndex > 0) {
                const resultPrevious = await this._tangleCacheService.milestoneDetails(
                    this.props.network, previousIndex);
                if (resultPrevious) {
                    hasPrevious = true;
                }
            }

            const resultNext = await this._tangleCacheService.milestoneDetails(
                this.props.network, nextIndex);
            if (resultNext) {
                hasNext = true;
            }

            this.setState({
                previousIndex,
                nextIndex,
                hasPrevious,
                hasNext
            });

            if (!hasNext) {
                setTimeout(async () => this.checkForAdjacentMilestones(), 5000);
            }
        }
    }
}

export default MilestonePayload;
