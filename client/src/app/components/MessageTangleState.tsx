import classNames from "classnames";
import React, { ReactNode } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { DateHelper } from "../../helpers/dateHelper";
import { TangleCacheService } from "../../services/tangleCacheService";
import AsyncComponent from "./AsyncComponent";
import "./MessageTangleState.scss";
import { MessageTangleStateProps } from "./MessageTangleStateProps";
import { MessageTangleStateState } from "./MessageTangleStateState";

/**
 * Component which will display a message tangle state.
 */
class MessageTangleState extends AsyncComponent<MessageTangleStateProps, MessageTangleStateState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * Create a new instance of Milestone.
     * @param props The props.
     */
    constructor(props: MessageTangleStateProps) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");

        this.state = {
            messageId: ""
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
    public async componentDidUpdate(prevProps: MessageTangleStateProps): Promise<void> {
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
            <div className="messages-tangle-state">
                {this.props.status === "referenced" &&
                    <div className="message-tangle-reference">

                        {this.props.milestoneIndex !== undefined && this.props.milestoneIndex > 1
                            ? (
                                <div>
                                    Referenced by {" "}
                                    <span
                                        className="message-tangle-reference__link"
                                        onClick={() => {
                                            if (this.props.onClick) {
                                                this.props.onClick(this.state.messageId);
                                            }
                                        }}
                                    >Milestone
                                    </span>
                                    {" "} {this.props.milestoneIndex} {this.state.timestamp}
                                </div>
                            ) : ""}
                    </div>}

                {this.props.status === "milestone" &&
                    <div className="message-tangle-reference">

                        {this.props.milestoneIndex !== undefined && this.props.milestoneIndex > 1
                            ? (
                                <div>
                                    <span
                                        className="message-tangle-reference__link"
                                        onClick={() => {
                                            if (this.props.onClick) {
                                                this.props.onClick(this.state.messageId);
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
                                "message-tangle-state",
                                { "message-tangle-state__no-click": !this.props.onClick },
                                {
                                    "message-tangle-state__confirmed": this.props.status === "referenced" &&
                                        !this.props.hasConflicts
                                },
                                {
                                    "message-tangle-state__conflicting": this.props.status === "referenced" &&
                                        this.props.hasConflicts
                                },
                                { "message-tangle-state__pending": this.props.status === "pending" },
                                { "message-tangle-state__unknown": this.props.status === "unknown" }
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
                this.props.network, this.props.milestoneIndex);
            if (result) {
                this.setState({
                    timestamp: result.timestamp
                        ? ` at ${DateHelper.formatShort(DateHelper.milliseconds(result.timestamp))}`
                        : undefined,
                    messageId: result.messageId
                });
            }
        }
    }
}

export default MessageTangleState;
