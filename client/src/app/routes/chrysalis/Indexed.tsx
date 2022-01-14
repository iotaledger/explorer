import { Converter } from "@iota/util.js";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { TextHelper } from "../../../helpers/textHelper";
import { SettingsService } from "../../../services/settingsService";
import { TangleCacheService } from "../../../services/tangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import DataToggle from "../../components/DataToggle";
import Modal from "../../components/Modal";
import { ModalIcon } from "../../components/ModalProps";
import Spinner from "../../components/Spinner";
import messageJSON from "./../../../assets/modals/message.json";
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
                utf8Index = TextHelper.isUTF8(Converter.hexToBytes(this.props.match.params.index))
                    ? Converter.hexToUtf8(this.props.match.params.index)
                    : undefined;
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
                indexLengthBytes: hexIndex.length / 2,
                cursor: result.cursor,
                status: "",
                statusBusy: false
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
        const TOGGLE_INDEX_OPTIONS = this.state.utf8Index ? [
            {
                label: "Text", content: this.state.utf8Index
            },
            {
                label: "HEX",
                content: this.state.hexIndex
            }
        ]
            : [
                {
                    label: "HEX",
                    content: this.state.hexIndex
                }
            ];
        return (
            <div className="indexed">
                <div className="wrapper">
                    <div className="inner">
                        <div className="row middle space-between">
                            <div className="row middle">
                                <h1>
                                    Indexed
                                </h1>
                                <Modal icon={ModalIcon.Dots} data={messageJSON} />
                            </div>
                        </div>
                        <div className="section">
                            <div className="section--header row space-between">

                                <div className="row middle">
                                    <h2>General</h2>
                                    <Modal icon={ModalIcon.Info} data={messageJSON} />
                                </div>
                                {this.state.statusBusy && (<Spinner compact />)}

                            </div>
                            <div className="section--data">
                                <div className="label row middle">
                                    <span className="margin-r-t">
                                        Index
                                    </span>
                                </div>
                                <DataToggle
                                    options={TOGGLE_INDEX_OPTIONS}
                                />
                            </div>
                        </div>
                        <div className="section margin-t-s">
                            <div className="section--header row space-between">
                                <div className="row middle">
                                    <h2>Indexed Messages</h2>
                                    {this.state.messageIds !== undefined && (
                                        <span className="indexed-number">
                                            {this.state.messageIds.length}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div
                                className={classNames("indexed-messages scroll-limit", {
                                    "scroll-limit__disabled": this.state.statusBusy
                                })}
                            >
                                {this.state.status && (
                                    <p>{this.state.status}</p>
                                )}
                                {this.state.messageIds && this.state.messageIds.length === 0 && (
                                    <div className="value">
                                        There are no messages for this index.
                                    </div>
                                )}
                                {this.state.messageIds &&
                                    this.state.messageIds.length > 0 &&
                                    this.state.messageIds.map(messageId => (
                                        <div
                                            key={messageId}
                                            className="indexed-message "
                                        >
                                            <button
                                                type="button"
                                                onClick={() => this.props.history.push(
                                                    `/${this.props.match.params.network
                                                    }/message/${messageId}`)}
                                            >
                                                <span>{messageId}</span>
                                            </button>
                                        </div>
                                    ))}
                            </div>

                            {this.state.cursor && (
                                <div className="indexed-actions flex row margin-t-m margin-b-m ">
                                    <button
                                        type="button"
                                        onClick={() => this.loadNextChunk(true)}
                                        className="form-button margin-r-s"
                                        disabled={this.state.statusBusy}
                                    >
                                        Load more
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => this.loadNextChunk(false)}
                                        className="form-button"
                                        disabled={this.state.statusBusy}
                                    >
                                        Reset
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Load the next chunk of data.
     * @param useCursor Use the cursor to load chunk.
     */
    private loadNextChunk(useCursor: boolean): void {
        this.setState({
            statusBusy: true
        }, async () => {
            const result = await this._tangleCacheService.search(
                this.props.match.params.network,
                this.props.match.params.index,
                useCursor ? this.state.cursor : undefined
            );

            this.setState({
                statusBusy: false,
                status: "",
                messageIds: result?.indexMessageIds,
                cursor: result?.cursor
            });
        });
    }
}

export default Indexed;
