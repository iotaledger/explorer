import { Converter } from "@iota/iota.js";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { SettingsService } from "../../../services/settingsService";
import { TangleCacheService } from "../../../services/tangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import MessageButton from "../../components/MessageButton";
import SidePanel from "../../components/SidePanel";
import Spinner from "../../components/Spinner";
import ToolsPanel from "../../components/ToolsPanel";
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
     * Settings service.
     */
    private readonly _settingsService: SettingsService;

    /**
     * Create a new instance of Indexed.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<IndexedRouteProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");
        this._settingsService = ServiceFactory.get<SettingsService>("settings");

        this.state = {
            statusBusy: true,
            status: "Loading indexed data...",
            advancedMode: this._settingsService.get().advancedMode ?? false
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        const result = await this._tangleCacheService.search(
            this.props.match.params.network, this.props.match.params.index);

        if (result?.indexMessageIds && result?.indexMessageType) {
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: "smooth"
            });

            let hexIndex;
            let utf8Index;
            if (result.indexMessageType === "hex") {
                hexIndex = this.props.match.params.index;
                utf8Index = Converter.hexToUtf8(this.props.match.params.index);
            } else {
                hexIndex = Converter.utf8ToHex(this.props.match.params.index);
                utf8Index = this.props.match.params.index;
            }

            const matchHexIndex = hexIndex.match(/.{1,2}/g);
            const formattedHexIndex = matchHexIndex ? matchHexIndex.join(" ") : hexIndex;

            this.setState({
                messageIds: result.indexMessageIds,
                utf8Index,
                hexIndex: formattedHexIndex,
                indexLengthBytes: hexIndex.length / 2
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
                                        <div className="card--label row middle">
                                            <span className="margin-r-t">
                                                Index {this.state.advancedMode
                                                    ? `UTF8 [${this.state.indexLengthBytes}]` : ""}
                                            </span>
                                            <MessageButton
                                                onClick={() => ClipboardHelper.copy(
                                                    this.state.utf8Index
                                                )}
                                                buttonType="copy"
                                                labelPosition="right"
                                            />
                                        </div>
                                        <div className="card--value">
                                            {this.state.utf8Index}
                                        </div>
                                        {this.state.advancedMode && (
                                            <React.Fragment>
                                                <div className="card--label row middle">
                                                    <span className="margin-r-t">
                                                        Index Hex [{this.state.indexLengthBytes}]
                                                    </span>
                                                    <MessageButton
                                                        onClick={() => ClipboardHelper.copy(
                                                            this.state.hexIndex?.replace(/ /g, "")
                                                        )}
                                                        buttonType="copy"
                                                        labelPosition="right"
                                                    />
                                                </div>
                                                <div className={classNames(
                                                    "card--value",
                                                    "card--value-textarea",
                                                    "card--value-textarea__hex",
                                                    "card--value-textarea__fit"
                                                )}
                                                >
                                                    {this.state.hexIndex}
                                                </div>
                                            </React.Fragment>
                                        )}
                                    </div>
                                </div>
                                <div className="card margin-t-s">
                                    <div className="card--header row space-between">
                                        <div className="row middle">
                                            <h2>Indexed Messages</h2>
                                            {this.state.messageIds !== undefined && (
                                                <span className="card--header-count">
                                                    {this.state.messageIds.length}
                                                </span>
                                            )}
                                        </div>
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
                            <div className="side-panel-container">
                                <SidePanel {...this.props} />
                                <ToolsPanel>
                                    <div className="card--section">
                                        <div className="card--label margin-t-t">
                                            <span>Advanced View</span>
                                            <input
                                                type="checkbox"
                                                checked={this.state.advancedMode}
                                                className="margin-l-t"
                                                onChange={e => this.setState(
                                                    {
                                                        advancedMode: e.target.checked
                                                    },
                                                    () => this._settingsService.saveSingle(
                                                        "advancedMode",
                                                        this.state.advancedMode))}
                                            />
                                        </div>
                                    </div>
                                </ToolsPanel>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        );
    }
}

export default Indexed;
