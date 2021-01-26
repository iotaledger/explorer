import React, { ReactNode } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { DateHelper } from "../../../helpers/dateHelper";
import { TangleCacheService } from "../../../services/tangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import MessageButton from "../../components/MessageButton";
import SidePanel from "../../components/SidePanel";
import "./Milestone.scss";
import { MilestoneRouteProps } from "./MilestoneRouteProps";
import { MilestoneState } from "./MilestoneState";

/**
 * Component which will show the milestone page.
 */
class Milestone extends AsyncComponent<RouteComponentProps<MilestoneRouteProps>, MilestoneState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * Create a new instance of Milestone.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<MilestoneRouteProps>) {
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

        await this.loadIndex(this.props.match.params.milestoneIndex, false);
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="milestone">
                <div className="wrapper">
                    <div className="inner">
                        <h1>
                            Milestone
                        </h1>
                        <div className="row top">
                            <div className="cards">
                                <div className="card">
                                    <div className="card--header card--header__space-between">
                                        <h2>
                                            General
                                        </h2>
                                    </div>
                                    <div className="card--content">
                                        <div className="card--label">
                                            Index
                                        </div>
                                        <div className="card--value">
                                            {this.state.milestone?.index}
                                        </div>
                                        <div className="card--label">
                                            Message Id
                                        </div>
                                        <div className="card--value row middle">
                                            <span className="margin-r-t">
                                                <Link
                                                    to={`/${this.props.match.params.network
                                                        }/message/${this.state.milestone?.messageId}`}
                                                    className="info-box--title linked"
                                                >
                                                    {this.state.milestone?.messageId}
                                                </Link>

                                            </span>
                                            <MessageButton
                                                onClick={() => ClipboardHelper.copy(
                                                    this.state.milestone?.messageId
                                                )}
                                                buttonType="copy"
                                                labelPosition="top"
                                            />
                                        </div>
                                        <div className="card--label">
                                            Date
                                        </div>
                                        <div className="card--value">
                                            {this.state.milestone?.timestamp && DateHelper.format(
                                                DateHelper.milliseconds(
                                                    this.state.milestone?.timestamp
                                                )
                                            )}
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
                                    </div>
                                </div>
                            </div>
                            <SidePanel {...this.props} />
                        </div>
                    </div>
                </div>
            </div >
        );
    }

    /**
     * Load the milestone with the given index.
     * @param index The index to load.
     * @param updateUrl Update the url.
     */
    private async loadIndex(index: string, updateUrl: boolean): Promise<void> {
        const result = await this._tangleCacheService.search(
            this.props.match.params.network, index);

        if (result?.milestone) {
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: "smooth"
            });

            this.setState({
                milestone: result.milestone
            }, async () => this.checkForAdjacentMilestones());

            if (updateUrl) {
                window.history.replaceState(
                    undefined,
                    window.document.title,
                    `/${this.props.match.params.network
                    }/milestone/${index}`);
            }
        } else {
            this.props.history.replace(`/${this.props.match.params.network
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
                const resultPrevious = await this._tangleCacheService.search(
                    this.props.match.params.network, previousIndex.toString());
                if (resultPrevious?.milestone) {
                    hasPrevious = true;
                }
            }

            const resultNext = await this._tangleCacheService.search(
                this.props.match.params.network, nextIndex.toString());
            if (resultNext?.milestone) {
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

export default Milestone;
