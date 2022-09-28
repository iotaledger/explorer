/* eslint-disable max-len */
import React, { ReactNode } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { DateHelper } from "../../../helpers/dateHelper";
import { CHRYSALIS } from "../../../models/config/protocolVersion";
import { ChrysalisTangleCacheService } from "../../../services/chrysalis/chrysalisTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import Modal from "../../components/Modal";
import milestoneMessage from "./../../../assets/modals/chrysalis/message/milestone-payload.json";
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
    private readonly _tangleCacheService: ChrysalisTangleCacheService;

    /**
     * Create a new instance of MilestonePayload.
     * @param props The props.
     */
    constructor(props: MilestonePayloadProps) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<ChrysalisTangleCacheService>(`tangle-cache-${CHRYSALIS}`);


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
                        {this.props.payload.index}
                    </div>
                </div>
                <div className="section--data">
                    <div className="label">
                        Date
                    </div>
                    <div className="value">
                        {this.props.payload.timestamp && DateHelper.format(
                            DateHelper.milliseconds(
                                this.props.payload.timestamp
                            )
                        )}
                    </div>
                </div>
                {this.props.advancedMode && (
                    <React.Fragment>
                        <div className="section--data">
                            <div className="label">
                                Inclusion Merkle Proof
                            </div>
                            <div className="value code">
                                {this.props.payload.inclusionMerkleProof}
                            </div>
                        </div>
                        {this.props.payload.nextPoWScore !== 0 && this.props.payload.nextPoWScoreMilestoneIndex !== 0 && (
                            <React.Fragment>
                                <div className="section--data">
                                    <div className="label">
                                        Next PoW Score
                                    </div>
                                    <div className="value code">
                                        {this.props.payload.nextPoWScore}
                                    </div>
                                </div>
                                <div className="section--data">

                                    <div className="label">
                                        Next PoW Score Milestone Index
                                    </div>
                                    <div className="value code">
                                        {this.props.payload.nextPoWScoreMilestoneIndex}
                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                        {this.props.payload.publicKeys && (
                            <div className="section--data">
                                <div className="label">
                                    Public Keys
                                </div>
                                <div className="value code">
                                    {this.props.payload.publicKeys?.map(pubKey => (
                                        <div key={pubKey} className="margin-b-s">
                                            {pubKey}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="section--data">
                            <div className="label">
                                Signatures
                            </div>
                            <div className="value code">
                                {this.props.payload.signatures.map(sig => (
                                    <div key={sig} className="margin-b-s">
                                        {sig}
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
            this.props.network, Number.parseInt(index, 10));

        if (result) {
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: "smooth"
            });

            this.setState({
                milestone: result
            }, async () => this.checkForAdjacentMilestones());

            if (updateUrl) {
                window.location.href = `/${this.props.network}/message/${this.state.milestone?.messageId}`;
            }
        } else {
            this.props.history.replace(`/${this.props.network
                }/search/${index}`);
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
