import { IOutputResponse, UnitsHelper } from "@iota/iota.js";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { Bech32AddressHelper } from "../../../helpers/bech32AddressHelper";
import { NetworkService } from "../../../services/networkService";
import { SettingsService } from "../../../services/settingsService";
import { TangleCacheService } from "../../../services/tangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import Bech32Address from "../../components/chrysalis/Bech32Address";
import Spinner from "../../components/Spinner";
import Transaction from "./../../components/chrysalis/Transaction";
import "./Addr.scss";
import { AddrRouteProps } from "./AddrRouteProps";
import { AddrState } from "./AddrState";

/**
 * Component which will show the address page.
 */
class Addr extends AsyncComponent<RouteComponentProps<AddrRouteProps>, AddrState> {
    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: TangleCacheService;

    /**
     * Settings service.
     */
    private readonly _settingsService: SettingsService;

    /**
     * The hrp of bech addresses.
     */
    private readonly _bechHrp: string;

    /**
     * Create a new instance of Addr.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<AddrRouteProps>) {
        super(props);

        this._tangleCacheService = ServiceFactory.get<TangleCacheService>("tangle-cache");
        this._settingsService = ServiceFactory.get<SettingsService>("settings");

        const networkService = ServiceFactory.get<NetworkService>("network");
        const networkConfig = this.props.match.params.network
            ? networkService.get(this.props.match.params.network)
            : undefined;

        this._bechHrp = networkConfig?.bechHrp ?? "iot";

        this.state = {
            ...Bech32AddressHelper.buildAddress(
                this._bechHrp,
                props.match.params.address
            ),
            formatFull: false,
            statusBusy: true,
            status: "Loading transactions..."
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        const result = await this._tangleCacheService.search(
            this.props.match.params.network, this.props.match.params.address);

        if (result?.address) {
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: "smooth"
            });

            this.setState({
                address: result.address,
                bech32AddressDetails: Bech32AddressHelper.buildAddress(
                    this._bechHrp,
                    result.address.address,
                    result.address.addressType
                ),
                balance: result.address.balance,
                outputIds: result.addressOutputIds,
                historicOutputIds: result.historicAddressOutputIds
            }, async () => {
                const outputs: IOutputResponse[] = [];

                if (result.addressOutputIds) {
                    for (const outputId of result.addressOutputIds) {
                        const outputResult = await this._tangleCacheService.outputDetails(
                            this.props.match.params.network, outputId);

                        if (outputResult) {
                            outputs.push(outputResult);

                            this.setState({
                                outputs,
                                status: `Loading transactions [${outputs.length}/${result.addressOutputIds.length}]`
                            });
                        }

                        if (!this._isMounted) {
                            break;
                        }
                    }
                }
                this.setState({
                    outputs,
                    status: "",
                    statusBusy: false
                });
            });
        } else {
            this.props.history.replace(`/${this.props.match.params.network}/search/${this.props.match.params.address}`);
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="addr">
                <div className="wrapper">
                    <div className="inner">
                        <div className="addr--header">
                            <h1>
                                Address
                            </h1>
                        </div>
                        <div className="top">
                            <div className="sections">
                                <div className="section">
                                    <div className="section--header">
                                        <h2>
                                            General
                                        </h2>
                                    </div>
                                    <div className="section--content">
                                        <Bech32Address
                                            addressDetails={this.state.bech32AddressDetails}
                                            advancedMode={true}
                                        />
                                        {/* {this.state.balance !== undefined && this.state.balance !== 0 && (
                                            <div className="row fill margin-t-s margin-b-s value-buttons">
                                                <div className="col">
                                                    <ValueButton value={this.state.balance ?? 0} label="Balance" />
                                                </div>
                                                <div className="col">
                                                    <CurrencyButton
                                                        marketsRoute={`/${this.props.match.params.network}/markets`}
                                                        value={this.state.balance ?? 0}
                                                    />
                                                </div>
                                            </div>
                                        )} */}
                                        {this.state.balance !== undefined && this.state.balance === 0 && (
                                            <div>
                                                <div className="section--label">
                                                    Balance
                                                </div>
                                                <div className="section--value">
                                                    0
                                                </div>
                                            </div>
                                        )}
                                        {this.state.balance !== undefined && this.state.balance !== 0 && (
                                            <div>
                                                <div className="section--label">
                                                    Balance
                                                </div>
                                                <div className="section--value">
                                                    {UnitsHelper.formatBest(this.state.balance)}
                                                </div>
                                            </div>
                                        )}
                                        {this.state.status && (
                                            <div className="middle row">
                                                {this.state.statusBusy && (<Spinner />)}
                                                <p className="status">
                                                    {this.state.status}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {this.state.outputs && this.state.outputs.length === 0 && (
                                    <div className="section">
                                        <div className="section--content">
                                            <p>
                                                There are no transactions for this address.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {this.state.outputs && this.state.outputs.length > 0 && (
                                    <div className="section transaction--section">
                                        <div className="section--header">
                                            <h2>
                                                Transaction History
                                            </h2>
                                        </div>
                                        <table className="transaction--table">
                                            <tr>
                                                <th>Message id</th>
                                                <th>Date</th>
                                                <th>Inputs</th>
                                                <th>Outputs</th>
                                                <th>Status</th>
                                                <th>Amount</th>
                                            </tr>
                                            {
                                                this.state.outputs.map(output =>
                                                (
                                                    <Transaction
                                                        key={output?.messageId}
                                                        output={output}
                                                        network={this.props.match.params.network}
                                                    />
                                                )
                                                )
                                            }
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Addr;
