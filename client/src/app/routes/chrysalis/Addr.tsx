import { IOutputResponse } from "@iota/iota.js";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { Bech32AddressHelper } from "../../../helpers/bech32AddressHelper";
import { NetworkService } from "../../../services/networkService";
import { TangleCacheService } from "../../../services/tangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import Bech32Address from "../../components/chrysalis/Bech32Address";
import Output from "../../components/chrysalis/Output";
import CurrencyButton from "../../components/CurrencyButton";
import SidePanel from "../../components/SidePanel";
import Spinner from "../../components/Spinner";
import ValueButton from "../../components/ValueButton";
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
            statusBusy: true,
            status: "Loading outputs..."
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
                outputIds: result.addressOutputIds
            }, async () => {
                const outputs: IOutputResponse[] = [];

                if (result.addressOutputIds) {
                    for (const outputId of result.addressOutputIds) {
                        const outputResult = await this._tangleCacheService.outputDetails(
                            this.props.match.params.network, outputId);

                        if (outputResult) {
                            outputs.push(outputResult);

                            this.setState({
                                outputs
                            });
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
                        <h1>
                            Address
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
                                        <Bech32Address addressDetails={this.state.bech32AddressDetails} />
                                        {this.state.balance !== undefined && this.state.balance !== 0 && (
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
                                        )}
                                        {this.state.balance !== undefined && this.state.balance === 0 && (
                                            <div>
                                                <div className="card--label">
                                                    Balance
                                                </div>
                                                <div className="card--value">
                                                    0
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {this.state.outputs && this.state.outputs.length === 0 && (
                                    <div className="card">
                                        <div className="card--content">
                                            <p>There are no outputs for this address.</p>
                                        </div>
                                    </div>
                                )}
                                {this.state.outputs &&
                                    this.state.outputIds &&
                                    this.state.outputs.length > 0 &&
                                    this.state.outputs.map((output, idx) => (
                                        <div className="card" key={idx}>
                                            <Output
                                                key={idx}
                                                index={idx + 1}
                                                network={this.props.match.params.network}
                                                history={this.props.history}
                                                id={this.state.outputIds ? this.state.outputIds[idx] : ""}
                                                output={output}
                                            />
                                        </div>
                                    ))}
                                {this.state.status && (
                                    <div className="card margin-t-s">
                                        <div className="card--content middle row">
                                            {this.state.statusBusy && (<Spinner />)}
                                            <p className="status">
                                                {this.state.status}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <SidePanel {...this.props} />
                        </div>
                    </div>
                </div>
            </div >
        );
    }
}

export default Addr;
