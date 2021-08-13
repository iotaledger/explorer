/* eslint-disable max-len */
import React, { ReactNode } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { DateHelper } from "../../../helpers/dateHelper";
import { TangleCacheService } from "../../../services/tangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import { MilestonePayloadProps } from "./MilestonePayloadProps";
import { MilestonePayloadState } from "./MilestonePayloadState";

/**
 * Component which will display a milestone payload.
 */
class MilestonePayload extends AsyncComponent<MilestonePayloadProps, MilestonePayloadState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * Create a new instance of MilestonePayload.
     * @param props The props.
     */
    constructor(props: MilestonePayloadProps) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");


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
                <div className="card--header">
                    <h2>Milestone Payload</h2>
                </div>
                <div className="card--content">
                    <div className="card--label">
                        Index
                    </div>
                    <div className="card--value">
                        {this.props.payload.index}
                    </div>
                    <div className="card--label">
                        Date
                    </div>
                    <div className="card--value">
                        {this.props.payload.timestamp && DateHelper.format(
                            DateHelper.milliseconds(
                                this.props.payload.timestamp
                            )
                        )}
                    </div>
                    {this.props.advancedMode && (
                        <React.Fragment>
                            <div className="card--label">
                                Inclusion Merkle Proof
                            </div>
                            <div className="card--value">
                                {this.props.payload.inclusionMerkleProof}
                            </div>
                            {this.props.payload.nextPoWScore !== 0 && this.props.payload.nextPoWScoreMilestoneIndex !== 0 && (
                                <React.Fragment>
                                    <div className="card--label">
                                        Next PoW Score
                                    </div>
                                    <div className="card--value">
                                        {this.props.payload.nextPoWScore}
                                    </div>
                                    <div className="card--label">
                                        Next PoW Score Milestone Index
                                    </div>
                                    <div className="card--value">
                                        {this.props.payload.nextPoWScoreMilestoneIndex}
                                    </div>
                                </React.Fragment>
                            )}
                            {this.props.payload.publicKeys && (
                                <React.Fragment>
                                    <div className="card--label">
                                        Public Keys
                                    </div>
                                    <div className="card--value">
                                        {this.props.payload.publicKeys?.map(pubKey => (
                                            <div key={pubKey} className="margin-b-s">
                                                {pubKey}
                                            </div>
                                        ))}
                                    </div>
                                </React.Fragment>
                            )}
                            <div className="card--label">
                                Signatures
                            </div>
                            <div className="card--value">
                                {this.props.payload.signatures.map(sig => (
                                    <div key={sig} className="margin-b-s">
                                        {sig}
                                    </div>
                                ))}
                            </div>
                            {(this.state.hasPrevious || this.state.hasNext) && (
                                <React.Fragment>
                                    <div className="card--label">
                                        Actions
                                    </div>
                                    <div className="row middle">
                                        <button
                                            disabled={!this.state.hasPrevious}
                                            type="button"
                                            onClick={async () =>
                                                this.loadIndex(this.state.previousIndex.toString(), true)}
                                            className="card--action margin-r-t"
                                        >
                                            Previous Milestone
                                        </button>
                                        <button
                                            disabled={!this.state.hasNext}
                                            type="button"
                                            onClick={async () =>
                                                this.loadIndex(this.state.nextIndex.toString(), true)}
                                            className="card--action margin-r-t"
                                        >
                                            Next Milestone
                                        </button>
                                    </div>
                                </React.Fragment>
                            )}
                        </React.Fragment>
                    )}
                </div>
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
