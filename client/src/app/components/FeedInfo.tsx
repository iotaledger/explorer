import moment from "moment";
import React, { ReactNode } from "react";
import { CUSTOM, LEGACY_MAINNET } from "../../models/config/networkType";
import AsyncComponent from "../components/AsyncComponent";
import { FeedInfoProps } from "./FeedInfoProps";
import "./FeedInfo.scss";
import { FeedInfoState } from "./FeedInfoState";

/**
 * Component which will display feed info.
 */
class FeedInfo extends AsyncComponent<FeedInfoProps, FeedInfoState> {
    /**
     * Timer id for seconds since last milestone.
     */
    private _secondsTimer?: NodeJS.Timer;

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
        if (this.props.network) {
            this.updateSecondsSinceLastMilesone();
        }
    }

    public componentWillUnmount(): void {
        super.componentWillUnmount();
        if (this._secondsTimer) {
            clearInterval(this._secondsTimer);
            this._secondsTimer = undefined;
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { latestMilestoneIndex, milestoneFrequencyTarget } = this.props;

        return (
            <div className="feed--metrics padding-l-8">
                <div className="latest-index">
                    <h3>Latest Milestone:</h3>
                    <span className="metrics-value margin-l-t">{latestMilestoneIndex}</span>
                </div>
                {this.state?.secondsSinceLastMilestone !== undefined && (
                    <div className="seconds">
                        <h3>Last{milestoneFrequencyTarget ? " / Target" : ""}:</h3>
                        <span className="metrics-value margin-l-t">
                            {this.state.secondsSinceLastMilestone}s{milestoneFrequencyTarget
                            ? ` / ${milestoneFrequencyTarget}s`
                            : ""}
                        </span>
                    </div>
                )}
            </div>
        );
    }

    private updateSecondsSinceLastMilesone() {
        const isEnabled = this.props.network !== LEGACY_MAINNET && this.props.network !== CUSTOM;
        if (this.props.latestMilestoneTimestamp !== 0 && isEnabled) {
            const from = moment(this.props.latestMilestoneTimestamp);
            const to = moment();

            const secondsSinceLastMilestone = to.diff(from, "seconds");

            this.setState({
                secondsSinceLastMilestone
            });
        }

        if (this._isMounted && isEnabled) {
            this._secondsTimer = setInterval(() => this.updateSecondsSinceLastMilesone(), 1000);
        }
    }
}

export default FeedInfo;
