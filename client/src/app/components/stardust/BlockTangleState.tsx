import classNames from "classnames";
import React, { ReactNode } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { DateHelper } from "../../../helpers/dateHelper";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../AsyncComponent";
import { BlockTangleStateProps } from "./BlockTangleStateProps";
import { BlockTangleStateState } from "./BlockTangleStateState";
import "./BlockTangleState.scss";

/**
 * Component which will display a block tangle state.
 */
class BlockTangleState extends AsyncComponent<BlockTangleStateProps, BlockTangleStateState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: StardustTangleCacheService;

    /**
     * Create a new instance of Milestone.
     * @param props The props.
     */
    constructor(props: BlockTangleStateProps) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);

        this.state = {
            blockId: ""
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        await this.updateMilestone();
    }

    /**
     * The component was updated.
     * @param prevProps The previous properties.
     */
    public async componentDidUpdate(prevProps: BlockTangleStateProps): Promise<void> {
        if (this.props.milestoneIndex !== prevProps.milestoneIndex) {
            await this.updateMilestone();
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="blocks-tangle-state">
                {this.props.status === "referenced" &&
                    <div className="block-tangle-reference">

                        {this.props.milestoneIndex !== undefined && this.props.milestoneIndex > 1
                            ? (
                                <div>
                                    Referenced by {" "}
                                    <span
                                        className="block-tangle-reference__link"
                                        onClick={() => {
                                            if (this.props.onClick) {
                                                this.props.onClick(this.state.blockId);
                                            }
                                        }}
                                    >Milestone {this.props.milestoneIndex}
                                    </span>
                                    {" "} {this.state.timestamp}
                                </div>
                            ) : ""}
                    </div>}

                {this.props.status === "milestone" &&
                    <div className="block-tangle-reference">

                        {this.props.milestoneIndex !== undefined && this.props.milestoneIndex > 1
                            ? (
                                <div>
                                    <span
                                        className="block-tangle-reference__link"
                                        onClick={() => {
                                            if (this.props.onClick) {
                                                this.props.onClick(this.state.blockId);
                                            }
                                        }}
                                    >Milestone  {" "} {this.props.milestoneIndex}
                                    </span>
                                    {" "} created at {this.state.timestamp}
                                </div>
                            ) : ""}
                    </div>}

                {this.props.status !== "milestone" &&
                    <div
                        className={
                            classNames(
                                "block-tangle-state",
                                { "block-tangle-state__no-click": !this.props.onClick },
                                {
                                    "block-tangle-state__confirmed": this.props.status === "referenced" &&
                                        !this.props.hasConflicts
                                },
                                {
                                    "block-tangle-state__conflicting": this.props.status === "referenced" &&
                                        this.props.hasConflicts
                                },
                                { "block-tangle-state__pending": this.props.status === "pending" },
                                { "block-tangle-state__unknown": this.props.status === "unknown" }
                            )
                        }
                    >
                        {this.props.status === "unknown" && ("Unknown")}
                        {this.props.status === "referenced" && !this.props.hasConflicts && ("Confirmed")}
                        {this.props.status === "pending" && ("Pending")}
                        {this.props.hasConflicts && ("Conflicting")}
                    </div>}
            </div>
        );
    }

    /**
     * Update the milestone info.
     */
    private async updateMilestone(): Promise<void> {
        if (this.props.milestoneIndex) {
            const result = await this._tangleCacheService.milestoneDetails(
                this.props.network, this.props.milestoneIndex
            );
            if (result) {
                this.setState({
                    timestamp: result.milestone?.timestamp
                        ? ` at ${DateHelper.formatShort(DateHelper.milliseconds(result.milestone?.timestamp))}`
                        : undefined,
                    blockId: result.blockId
                });
            }
        }
    }
}

export default BlockTangleState;
