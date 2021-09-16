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
import QR from "../../components/chrysalis/QR";
import FiatValue from "../../components/FiatValue";
import Spinner from "../../components/Spinner";
import messageJSON from "./../../../assets/modals/message.json";
import Transaction from "./../../components/chrysalis/Transaction";
import Modal from "./../../components/Modal";
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
            status: "Loading transactions...",
            filterValue: "all",
            received: 0,
            sent: 0
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
                const historicOutputs: IOutputResponse[] = [];

                if (result.historicAddressOutputIds) {
                    for (const outputId of result.historicAddressOutputIds) {
                        const outputResult = await this._tangleCacheService.outputDetails(
                            this.props.match.params.network, outputId);

                        if (outputResult) {
                            historicOutputs.push(outputResult);

                            this.setState({
                                historicOutputs,
                                status: "Loading historic..."
                            });
                        }

                        if (!this._isMounted) {
                            break;
                        }
                    }
                }
                this.setState({
                    outputs: outputs.concat(historicOutputs),
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
                            <div className="row middle">
                                <h1>
                                    Address
                                </h1>
                                <Modal icon="dots" data={messageJSON} />
                            </div>
                        </div>
                        <div className="top">
                            <div className="sections">
                                <div className="section">
                                    <div className="section--header">
                                        <div className="row middle">
                                            <h2>
                                                General
                                            </h2>
                                            <Modal icon="info" data={messageJSON} />
                                        </div>
                                    </div>
                                    <div className="row space-between general-content">
                                        <div className="section--content">
                                            <Bech32Address
                                                addressDetails={this.state.bech32AddressDetails}
                                                advancedMode={true}
                                            />
                                            {this.state.received !== undefined && (
                                                <div>
                                                    <div className="section--label">
                                                        Total received
                                                    </div>
                                                    <div className="section--value">
                                                        {UnitsHelper.formatBest(this.state.received)}
                                                        {" "}(<FiatValue value={this.state.received} />)
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <div className="section--label">
                                                    Total sent
                                                </div>
                                                <div className="section--value">
                                                    {UnitsHelper.formatBest(this.state.sent)}
                                                    {" "}(<FiatValue value={this.state.sent} />)
                                                </div>

                                            </div>

                                            {this.state.balance !== undefined && this.state.balance === 0 && (
                                                <div>
                                                    <div className="section--label">
                                                        Final balance
                                                    </div>
                                                    <div className="section--value">
                                                        0
                                                    </div>
                                                </div>
                                            )}
                                            {this.state.balance !== undefined && this.state.balance !== 0 && (
                                                <div>
                                                    <div className="section--label">
                                                        Final balance
                                                    </div>
                                                    <div className="section--value">
                                                        {UnitsHelper.formatBest(this.state.balance)}
                                                        {" "}(<FiatValue value={this.state.balance} />)
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
                                        <div className="section--content">
                                            {this.state.bech32AddressDetails?.bech32 &&
                                                (
                                                    //  eslint-disable-next-line react/jsx-pascal-case
                                                    <QR data={this.state.bech32AddressDetails.bech32} />
                                                )}
                                        </div>
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
                                        <div className="section--header section--header__space-between">
                                            <div className="row middle">
                                                <h2>
                                                    Transaction History
                                                </h2>
                                                <Modal icon="info" data={messageJSON} />
                                            </div>
                                            <div className="messages-tangle-state">
                                                <div className="section--header__filter">
                                                    <button
                                                        className="filter-buttons"
                                                        type="button"
                                                        onClick={() => {
                                                            this.setState({ filterValue: "all" });
                                                        }}
                                                    >
                                                        All
                                                    </button>
                                                    <button
                                                        className="filter-buttons middle"
                                                        type="button"
                                                        onClick={() => {
                                                            this.setState({ filterValue: "incoming" });
                                                        }}
                                                    >
                                                        Incoming
                                                    </button>
                                                    <button
                                                        className="filter-buttons"
                                                        type="button"
                                                        onClick={() => {
                                                            this.setState({ filterValue: "outgoing" });
                                                        }}
                                                    >
                                                        Outgoing
                                                    </button>
                                                </div>
                                            </div>

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
                                                        filterValue={this.state.filterValue}
                                                        receivedAmountHandler={(amount: number): void => {
                                                            const received = this.state.received + amount;
                                                            let sent = this.state.sent;
                                                            if (this.state.balance) {
                                                                sent = received - this.state.balance;
                                                            }
                                                            this.setState({ received, sent });
                                                        }}
                                                    />
                                                )
                                                )
                                            }
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div >
                </div >
            </div >
        );
    }
}

export default Addr;
