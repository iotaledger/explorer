import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { TangleCacheService } from "../../../services/tangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import MessageButton from "../../components/MessageButton";
import SidePanel from "../../components/SidePanel";
import Spinner from "../../components/Spinner";
import "./Indexed.scss";
import { IndexedRouteProps } from "./IndexedRouteProps";
import { IndexedState } from "./IndexedState";

/**
 * Component which will show the indexes page.
 */
class Indexed extends AsyncComponent<RouteComponentProps<IndexedRouteProps>, IndexedState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * Create a new instance of Indexed.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<IndexedRouteProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");

        this.state = {
            statusBusy: true,
            status: "Loading indexed data..."
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        const result = await this._tangleCacheService.search(
            this.props.match.params.network, this.props.match.params.index);

        if (result?.indexMessageIds) {
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: "smooth"
            });

            this.setState({
                messageIds: result.indexMessageIds
            }, async () => {
                this.setState({
                    messages: [],
                    status: "",
                    statusBusy: false
                });
            });
        } else {
            this.props.history.replace(`/${this.props.match.params.network}/search/${this.props.match.params.index}`);
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="indexed">
                <div className="wrapper">
                    <div className="inner">
                        <h1>
                            Indexed Data
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
                                        <div className="card--value row middle">
                                            <span className="margin-r-t">{this.props.match.params.index}</span>
                                            <MessageButton
                                                onClick={() => ClipboardHelper.copy(
                                                    this.props.match.params.index
                                                )}
                                                buttonType="copy"
                                                labelPosition="top"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="card margin-t-s">
                                    <div className="card--header row space-between">
                                        <h2>Indexed Messages</h2>
                                        {this.state.statusBusy && (<Spinner />)}
                                    </div>

                                    <div className="card--content">
                                        {this.state.messageIds && this.state.messageIds.length === 0 && (
                                            <div className="card--value">
                                                There are no messages for this index.
                                            </div>
                                        )}
                                        {this.state.messageIds &&
                                            this.state.messageIds.length > 0 &&
                                            this.state.messageIds.map(messageId => (
                                                <div
                                                    key={messageId}
                                                    className="card--value"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => this.props.history.push(
                                                            `/${this.props.match.params.network
                                                            }/message/${messageId}`)}
                                                    >
                                                        {messageId}
                                                    </button>
                                                </div>
                                            ))}
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
}

export default Indexed;
