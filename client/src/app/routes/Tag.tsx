import { isTrytes } from "@iota/validators";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../factories/serviceFactory";
import { TangleCacheService } from "../../services/tangleCacheService";
import AsyncComponent from "../components/AsyncComponent";
import SidePanel from "../components/SidePanel";
import { NetworkProps } from "../NetworkProps";
import "./Tag.scss";
import { TagRouteProps } from "./TagRouteProps";
import { TagState } from "./TagState";

/**
 * Component which will show the tag page.
 */
class Tag extends AsyncComponent<RouteComponentProps<TagRouteProps> & NetworkProps, TagState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * Create a new instance of Tag.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<TagRouteProps> & NetworkProps) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");

        let tag;
        let tagFill;
        if (this.props.match.params.hash.length <= 27 &&
            isTrytes(this.props.match.params.hash)) {
            tag = props.match.params.hash;
            tagFill = "9".repeat(27 - tag.length);
        }

        this.state = {
            status: "Finding transactions...",
            tag,
            tagFill
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        if (this.state.tag) {
            window.scrollTo(0, 0);

            const { hashes, totalCount, limitExceeded } = await this._tangleCacheService.findTransactionHashes(
                this.props.networkConfig,
                "tags",
                this.props.match.params.hash
            );

            let status = "";

            if (limitExceeded) {
                status = "The requested tag exceeds the number of items it is possible to retrieve.";
            } else if (!hashes || hashes.length === 0) {
                status = "There are no transactions for the requested tag.";
            }

            this.setState({
                hashes,
                totalCount: limitExceeded ? undefined :
                    hashes.length < totalCount ? `${hashes.length} of ${totalCount}` : `${hashes.length}`,
                status
            });
        } else {
            this.props.history.replace(`/${this.props.networkConfig.network}/search/${this.props.match.params.hash}`);
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="tag">
                <div className="wrapper">
                    <div className="inner">
                        <h1>Tag</h1>
                        <div className="row top">
                            <div className="cards">
                                <div className="card">
                                    <div className="card--header">
                                        <h2>General</h2>
                                    </div>
                                    <div className="card--content">
                                        <div className="card--label">
                                            Tag
                                        </div>
                                        <div className="card--value">
                                            {this.state.tag}
                                            <span className="card--value__light">
                                                {this.state.tagFill}
                                            </span>

                                        </div>
                                    </div>
                                </div>
                                {this.state.status && (
                                    <p className="status margin-t-s">
                                        {this.state.status}
                                    </p>
                                )}
                                {!this.state.status && (
                                    <div className="card">
                                        <div className="card--header">
                                            <h2>Transactions</h2>
                                            {this.state.totalCount !== undefined && (
                                                <span className="card--header-count">{this.state.totalCount}</span>
                                            )}
                                        </div>
                                        <div className="card--content">
                                            {this.state.hashes && this.state.hashes.map(h => (
                                                <div className="card--value" key={h}>
                                                    <button
                                                        className="card--value"
                                                        onClick={() => this.props.history.push(`/${this.props.networkConfig.network}/transaction/${h}`)}
                                                    >
                                                        {h}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <SidePanel
                                networkConfig={this.props.networkConfig}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Tag;
