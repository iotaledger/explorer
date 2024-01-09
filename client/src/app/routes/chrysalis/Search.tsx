import React, { ReactNode } from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "~factories/serviceFactory";
import { CHRYSALIS, ProtocolVersion } from "~models/config/protocolVersion";
import { ChrysalisTangleCacheService } from "~services/chrysalis/chrysalisTangleCacheService";
import { NetworkService } from "~services/networkService";
import AsyncComponent from "../../components/AsyncComponent";
import Spinner from "../../components/Spinner";
import "../Search.scss";
import { SearchRouteProps } from "../SearchRouteProps";
import { SearchState } from "../SearchState";

/**
 * Component which will show the search page.
 */
class Search extends AsyncComponent<RouteComponentProps<SearchRouteProps>, SearchState> {
  /**
   * API Client for tangle requests.
   */
  private readonly _tangleCacheService: ChrysalisTangleCacheService;

  /**
   * Create a new instance of Search.
   * @param props The props.
   */
  constructor(props: RouteComponentProps<SearchRouteProps>) {
    super(props);

    const networkService = ServiceFactory.get<NetworkService>("network");
    const protocolVersion: ProtocolVersion =
      (props.match.params.network && networkService.get(props.match.params.network)?.protocolVersion) || CHRYSALIS;
    this._tangleCacheService = ServiceFactory.get<ChrysalisTangleCacheService>(`tangle-cache-${CHRYSALIS}`);

    this.state = {
      protocolVersion,
      statusBusy: true,
      status: "",
      completion: "",
      redirect: "",
      invalidError: "",
    };
  }

  /**
   * The component mounted.
   */
  public componentDidMount(): void {
    super.componentDidMount();
    window.scrollTo(0, 0);

    this.updateState();
  }

  /**
   * The component was updated.
   * @param prevProps The previous properties.
   */
  public componentDidUpdate(prevProps: RouteComponentProps<SearchRouteProps>): void {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.updateState();
    }
  }

  /**
   * Render the component.
   * @returns The node to render.
   */
  public render(): ReactNode {
    return this.state.redirect ?
        <Redirect to={this.state.redirect} />
      : <div className="search">
          <div className="wrapper">
            <div className="inner">
              <h1 className="margin-b-s">Search</h1>
              {!this.state.completion && this.state.status && (
                <div className="card">
                  <div className="card--header">
                    <h2>Searching</h2>
                  </div>
                  <div className="card--content middle row">
                    {this.state.statusBusy && <Spinner />}
                    <p className="status">{this.state.status}</p>
                  </div>
                </div>
              )}
              {this.state.completion === "notFound" && (
                <div className="card">
                  <div className="card--header">
                    <h2>Not found</h2>
                  </div>
                  <div className="card--content">
                    <p>We could not find any messages, addresses, outputs, milestones or indexes for the query.</p>
                    <br />
                    <div className="card--value">
                      <ul>
                        <li>
                          <span>Query</span>
                          <span>{this.props.match.params.query}</span>
                        </li>
                      </ul>
                    </div>
                    <br />
                    <p>The following formats are supported:</p>
                    <br />
                    <ul>
                      <li>
                        <span>Messages</span>
                        <span>64 Hex characters</span>
                      </li>
                      <li>
                        <span>Message using Transaction Id</span>
                        <span>64 Hex characters</span>
                      </li>
                      <li>
                        <span>Addresses</span>
                        <span>64 Hex characters or Bech32 Format</span>
                      </li>
                      <li>
                        <span>Outputs</span>
                        <span>68 Hex characters</span>
                      </li>
                      <li>
                        <span>Milestone Index</span>
                        <span>Numeric</span>
                      </li>
                      <li>
                        <span>Indexes</span>
                        <span>Maximum 64 UTF-8 chars or maximum 128 hex chars</span>
                      </li>
                      <li>
                        <span>DID</span>
                        <span>64 Hex characters starting with did:iota:</span>
                      </li>
                    </ul>
                    <br />
                    <p>Please perform another search with a valid hash.</p>
                  </div>
                </div>
              )}
              {this.state.completion === "invalid" && (
                <div className="card">
                  <div className="card--header">
                    <h2>Incorrect query format</h2>
                  </div>
                  <div className="card--content">
                    <p className="danger">{this.state.invalidError}.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>;
  }

  /**
   * Update the state of the component.
   */
  private updateState(): void {
    const query = (this.props.match.params.query ?? "").trim();

    let status = "";
    let statusBusy = false;
    let completion = "";
    const redirect = "";
    let invalidError = "";

    if (query.length > 0) {
      status = "Detecting query type...";
      statusBusy = true;
      if (this._isMounted) {
        setTimeout(async () => {
          if (this._isMounted) {
            const response = await this._tangleCacheService.search(this.props.match.params.network, query);

            if (response) {
              let objType = "";
              let objParam = query;
              if (response.message) {
                objType = "message";
              } else if (response.address) {
                objType = "addr";
              } else if (response.indexMessageIds) {
                objType = "indexed";
              } else if (response.output) {
                objType = "message";
                objParam = response.output.messageId;
              } else if (response.milestone) {
                objType = "message";
                objParam = response.milestone?.messageId;
              } else if (response.did) {
                objType = "identity-resolver";
                objParam = response.did;
              }
              this.setState({
                status: "",
                statusBusy: false,
                redirect: `/${this.props.match.params.network}/${objType}/${objParam}`,
              });
            } else {
              this.setState({
                completion: "notFound",
                status: "",
                statusBusy: false,
              });
            }
          }
        }, 0);
      }
    } else {
      invalidError = "the query is empty";
      completion = "invalid";
    }

    this.setState({
      statusBusy,
      status,
      completion,
      redirect,
      invalidError,
    });
  }
}

export default Search;
