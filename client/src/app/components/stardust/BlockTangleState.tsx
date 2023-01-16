import classNames from "classnames";
import moment from "moment";
import React, { ReactNode } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../AsyncComponent";
import Tooltip from "../Tooltip";
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
        const { timestamp, blockId } = this.state;
        const { status, milestoneIndex, hasConflicts, conflictReason, onClick } = this.props;
        const ago = timestamp ? moment(timestamp * 1000).fromNow() : undefined;

        return (
            <div className="blocks-tangle-state">
                {status === "milestone" &&
                    <div className="block-tangle-reference">
                        <div className="row">
                            <div
                                className={
                                    classNames(
                                        "block-tangle-state",
                                        { "block-tangle-state__no-click": !onClick },
                                        { "block-tangle-state__confirmed": milestoneIndex },
                                        { "block-tangle-state__pending": !milestoneIndex }
                                    )
                                }
                            >
                                {milestoneIndex && ("Confirmed")}
                                {!milestoneIndex && ("Pending")}
                            </div>
                            {milestoneIndex && (
                                <span className="row middle">
                                    Created {" "} {ago}
                                </span>
                            )}
                        </div>
                    </div>}

                {status !== "milestone" &&
                    <React.Fragment>
                        <div
                            className={
                                classNames(
                                    "block-tangle-state",
                                    { "block-tangle-state__no-click": !onClick },
                                    {
                                        "block-tangle-state__confirmed": status === "referenced" &&
                                            !hasConflicts
                                    },
                                    {
                                        "block-tangle-state__conflicting": status === "referenced" &&
                                            hasConflicts
                                    },
                                    { "block-tangle-state__pending": status === "pending" },
                                    { "block-tangle-state__unknown": status === "unknown" }
                                )
                            }
                        >
                            {status === "unknown" && ("Unknown")}
                            {status === "referenced" && !hasConflicts && ("Confirmed")}
                            {status === "pending" && ("Pending")}
                            {hasConflicts &&
                                <Tooltip tooltipContent={conflictReason}>
                                    <span style={{ color: "#ca493d" }}>Conflicting</span>
                                </Tooltip>}
                        </div>
                        {status === "referenced" && (
                            <div className="block-tangle-reference">
                                {milestoneIndex !== undefined && milestoneIndex > 1
                                    ? (
                                        <div>
                                            Referenced by {" "}
                                            <span
                                                className="block-tangle-reference__link"
                                                onClick={() => {
                                                    if (onClick) {
                                                        onClick(blockId);
                                                    }
                                                }}
                                            >Milestone {milestoneIndex}
                                            </span>
                                            {" "} {ago}
                                        </div>
                                    ) : ""}
                            </div>
                        )}
                    </React.Fragment>}
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
                    timestamp: result.milestone?.timestamp,
                    blockId: result.blockId
                });
            }
        }
    }
}

export default BlockTangleState;
