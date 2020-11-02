import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { TangleCacheService } from "../../../services/tangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import IndexationPayload from "../../components/chrysalis/IndexationPayload";
import MilestonePayload from "../../components/chrysalis/MilestonePayload";
import TransactionPayload from "../../components/chrysalis/TransactionPayload";
import Confirmation from "../../components/Confirmation";
import MessageButton from "../../components/MessageButton";
import Spinner from "../../components/Spinner";
import "./Message.scss";
import { MessageRouteProps } from "./MessageRouteProps";
import { MessageState } from "./MessageState";

/**
 * Component which will show the message page.
 */
class Message extends AsyncComponent<RouteComponentProps<MessageRouteProps>, MessageState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * Timer to check to state update.
     */
    private _timerId?: NodeJS.Timer;

    /**
     * Create a new instance of Message.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<MessageRouteProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");

        this.state = {
            confirmationState: "pending",
            childrenBusy: true
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        const result = await this._tangleCacheService.search(
            this.props.match.params.network, this.props.match.params.messageId);

        if (result?.message) {
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: "smooth"
            });

            this.setState({
                message: result.message
            }, async () => {
                const details = await this._tangleCacheService.messageDetails(
                    this.props.match.params.network, this.props.match.params.messageId, "all");

                this.setState({
                    metadata: details.metadata,
                    childrenIds: details.childrenIds,
                    confirmationState: details?.metadata?.referencedByMilestoneIndex !== undefined
                        ? "confirmed" : "pending",
                    childrenBusy: false
                });

                if (!details?.metadata?.referencedByMilestoneIndex) {
                    this._timerId = setInterval(async () => {
                        const details2 = await this._tangleCacheService.messageDetails(
                            this.props.match.params.network, this.props.match.params.messageId, "metadata", true);

                        this.setState({
                            metadata: details2.metadata,
                            confirmationState: details2?.metadata?.referencedByMilestoneIndex !== undefined
                                ? "confirmed" : "pending"
                        });

                        if (details2?.metadata?.referencedByMilestoneIndex && this._timerId) {
                            clearInterval(this._timerId);
                            this._timerId = undefined;
                        }
                    }, 10000);
                }
            });
        } else {
            this.props.history.replace(`/${this.props.match.params.network
                }/search/${this.props.match.params.messageId}`);
        }
    }

    /**
     * The component will unmount so update flag.
     */
    public componentWillUnmount(): void {
        super.componentWillUnmount();
        if (this._timerId) {
            clearInterval(this._timerId);
            this._timerId = undefined;
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="message">
                <div className="wrapper">
                    <div className="inner">
                        <h1>
                            Message
                        </h1>
                        <div className="row top">
                            <div className="cards">
                                <div className="card">
                                    <div className="card--header card--header__space-between">
                                        <h2>
                                            General
                                        </h2>
                                        <Confirmation
                                            state={this.state.confirmationState}
                                            milestoneIndex={this.state.metadata?.referencedByMilestoneIndex}
                                            onClick={this.state.metadata?.referencedByMilestoneIndex
                                                ? () => this.props.history.push(
                                                    `/${this.props.match.params.network
                                                    }/search/${this.state.metadata?.referencedByMilestoneIndex}`)
                                                : undefined}
                                        />
                                    </div>
                                    <div className="card--content">
                                        <div className="card--label">
                                            Message Id
                                        </div>
                                        <div className="card--value row middle">
                                            <span className="margin-r-t">{this.props.match.params.messageId}</span>
                                            <MessageButton
                                                onClick={() => ClipboardHelper.copy(
                                                    this.props.match.params.messageId
                                                )}
                                                buttonType="copy"
                                                labelPosition="top"
                                            />
                                        </div>
                                        {this.state.message && (
                                            <React.Fragment>
                                                <div className="card--label">
                                                    Parent Message 1
                                                </div>
                                                <div className="card--value row middle">
                                                    {this.state.message?.parent1MessageId !== "0".repeat(64) && (
                                                        <React.Fragment>
                                                            <button
                                                                type="button"
                                                                className="margin-r-t"
                                                                onClick={() => this.props.history.push(
                                                                    `/${this.props.match.params.network
                                                                    }/message/${this.state.message?.parent1MessageId}`)}
                                                            >
                                                                {this.state.message?.parent1MessageId}
                                                            </button>
                                                            <MessageButton
                                                                onClick={() => ClipboardHelper.copy(
                                                                    this.state.message?.parent1MessageId
                                                                )}
                                                                buttonType="copy"
                                                                labelPosition="top"
                                                            />
                                                        </React.Fragment>
                                                    )}
                                                    {this.state.message?.parent1MessageId === "0".repeat(64) && (
                                                        <span>Genesis</span>
                                                    )}
                                                </div>
                                                <div className="card--label">
                                                    Parent Message 2
                                                </div>
                                                <div className="card--value row middle">
                                                    {this.state.message?.parent2MessageId !== "0".repeat(64) && (
                                                        <React.Fragment>
                                                            <button
                                                                type="button"
                                                                className="margin-r-t"
                                                                onClick={() => this.props.history.push(
                                                                    `/${this.props.match.params.network
                                                                    }/message/${this.state.message?.parent2MessageId}`)}
                                                            >
                                                                {this.state.message?.parent2MessageId}
                                                            </button>
                                                            <MessageButton
                                                                onClick={() => ClipboardHelper.copy(
                                                                    this.state.message?.parent2MessageId
                                                                )}
                                                                buttonType="copy"
                                                                labelPosition="top"
                                                            />
                                                        </React.Fragment>
                                                    )}
                                                    {this.state.message?.parent2MessageId === "0".repeat(64) && (
                                                        <span>Genesis</span>
                                                    )}
                                                </div>
                                            </React.Fragment>
                                        )}
                                        <div className="card--label">
                                            Nonce
                                        </div>
                                        <div className="card--value row middle">
                                            <span className="margin-r-t">{this.state.message?.nonce}</span>
                                        </div>
                                        <div className="card--label">
                                            Is Solid
                                        </div>
                                        <div className="card--value row middle">
                                            <span className="margin-r-t">
                                                {this.state.metadata?.isSolid ? "Yes" : "No"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {this.state.message?.payload && (
                                    <React.Fragment>
                                        {this.state.message.payload.type === 0 && (
                                            <div className="transaction-payload-wrapper">
                                                <TransactionPayload
                                                    network={this.props.match.params.network}
                                                    history={this.props.history}
                                                    payload={this.state.message.payload}
                                                />
                                            </div>
                                        )}
                                        {this.state.message.payload.type === 1 && (
                                            <div className="card">
                                                <MilestonePayload
                                                    network={this.props.match.params.network}
                                                    history={this.props.history}
                                                    payload={this.state.message.payload}
                                                />
                                            </div>
                                        )}
                                        {this.state.message.payload.type === 2 && (
                                            <div className="card">
                                                <IndexationPayload
                                                    network={this.props.match.params.network}
                                                    history={this.props.history}
                                                    payload={this.state.message.payload}
                                                />
                                            </div>
                                        )}

                                        {this.state.message.payload.type === 0 &&
                                            this.state.message.payload.essence.payload && (
                                                <div className="card">
                                                    <IndexationPayload
                                                        network={this.props.match.params.network}
                                                        history={this.props.history}
                                                        payload={this.state.message.payload.essence.payload}
                                                    />
                                                </div>
                                            )}
                                    </React.Fragment>
                                )}

                                <div className="card margin-t-s">
                                    <div className="card--header">
                                        <h2>Child Messages</h2>
                                        {this.state.childrenIds !== undefined && (
                                            <span className="card--header-count">
                                                {this.state.childrenIds.length}
                                            </span>
                                        )}
                                    </div>
                                    <div className="card--content children-container">
                                        {this.state.childrenBusy && (<Spinner />)}
                                        {this.state.childrenIds?.map(childId => (
                                            <div className="card--value" key={childId}>
                                                <button
                                                    type="button"
                                                    onClick={() => this.props.history.push(
                                                        `/${this.props.match.params.network
                                                        }/message/${childId}`)}
                                                >
                                                    {childId}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        );
    }
}

export default Message;
