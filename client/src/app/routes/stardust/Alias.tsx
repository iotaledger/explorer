/* eslint-disable max-len */
/* eslint-disable camelcase */
import { ALIAS_ADDRESS_TYPE, ALIAS_OUTPUT_TYPE, FOUNDRY_OUTPUT_TYPE } from "@iota/iota.js-stardust";
import { Converter } from "@iota/util.js-stardust";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { STARDUST } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import CopyButton from "../../components/CopyButton";
import DataToggle from "../../components/DataToggle";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import AssetsTable from "../../components/stardust/AssetsTable";
import Bech32Address from "../../components/stardust/Bech32Address";
import Foundry from "../../components/stardust/Foundry";
import NetworkContext from "../../context/NetworkContext";
import { AliasRouteProps } from "../AliasRouteProps";
import mainHeaderMessage from "./../../../assets/modals/address/main-header.json";
import Modal from "./../../components/Modal";
import "./AddressPage.scss";
import { AliasState } from "./AliasState";
import IFoundryDetails from "./IFoundryDetails";

/**
 * Component which will show the address page for stardust.
 */
class Alias extends AsyncComponent<RouteComponentProps<AliasRouteProps>, AliasState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * Foundries page size.
     */
    private static readonly FOUNDRIES_PAGE_SIZE: number = 10;

    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: StardustTangleCacheService;

    /**
     * The hrp of bech addresses.
     */
    private readonly _bechHrp: string;

    /**
     * Create a new instance of Addr.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<AliasRouteProps>) {
        super(props);
        const networkService = ServiceFactory.get<NetworkService>("network");
        const networkConfig = this.props.match.params.network
            ? networkService.get(this.props.match.params.network)
            : undefined;

        this._tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);

        this._bechHrp = networkConfig?.bechHrp ?? "iota";

        this.state = {
            ...Bech32AddressHelper.buildAddress(this._bechHrp, props.match.params.aliasId),
            areFoundriesLoading: true,
            foundries: [],
            foundriesPageNumber: 1,
            foundriesPage: []
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        const result = await this._tangleCacheService.outputDetails(
            this.props.match.params.network, this.props.match.params.aliasId
        );

        if (result?.output?.type === ALIAS_OUTPUT_TYPE) {
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: "smooth"
            });

            this.setState(this.loadPayload());
            this.setState({
                bech32AddressDetails: Bech32AddressHelper.buildAddress(
                    this._bechHrp,
                    result.output?.aliasId,
                    ALIAS_ADDRESS_TYPE
                ),
                output: result.output
            }, async () => {
                await this.getControlledFoundries();
            });
        } else {
            this.props.history.replace(`/${this.props.match.params.network}/search/${this.props.match.params.aliasId}`);
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const networkId = this.props.match.params.network;
        const hasFoundries = this.state.foundries && this.state.foundries.length > 0;
        const TOGGLE_DATA_OPTIONS = [
            {
                label: this.state.jsonData ? "JSON" : "Text",
                content: this.state.jsonData ?? this.state.utf8Data,
                isJson: this.state.jsonData !== undefined
            },
            {
                label: "HEX",
                content: this.state.hexData
            }
        ];

        return (
            <div className="addr">
                <div className="wrapper">
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>
                                    Alias
                                </h1>
                                <Modal icon="info" data={mainHeaderMessage} />
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
                                        </div>
                                    </div>
                                    <div className="row space-between general-content">
                                        <div className="section--data">
                                            <Bech32Address
                                                addressDetails={this.state.bech32AddressDetails}
                                                advancedMode={true}
                                            />
                                            <div className="label">
                                                Alias ID
                                            </div>
                                            <div className="value row middle code">
                                                <span className="margin-r-t">{this.props.match.params.aliasId}</span>
                                                <CopyButton
                                                    onClick={() => ClipboardHelper.copy(this.props.match.params.aliasId)}
                                                    buttonType="copy"
                                                    labelPosition="top"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="section">
                                    <div className="section--header">
                                        <div className="row middle">
                                            <h2>
                                                State
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="section--data">
                                        <div>
                                            <div className="label">
                                                State Index
                                            </div>
                                            <span>{this.state.output?.stateIndex}</span>
                                        </div>
                                        <div className="margin-t-s">
                                            {TOGGLE_DATA_OPTIONS.some(option => option.content !== undefined) && (
                                                <DataToggle
                                                    options={TOGGLE_DATA_OPTIONS}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {this.state.areFoundriesLoading && (
                                    <div className="section transaction--section">
                                        <div className="section--header row space-between">
                                            <div className="margin-t-s middle row">
                                                <Spinner />
                                                <p className="status">Loading Foundries...</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {hasFoundries && (
                                    <div className="section transaction--section">
                                        <div className="section--header row space-between">
                                            <div className="row middle">
                                                <h2>
                                                    Controlled foundries ({this.state.foundries?.length})
                                                </h2>
                                                <Modal icon="info" data={mainHeaderMessage} />
                                            </div>
                                        </div>
                                        <table className="transaction--table">
                                            <thead>
                                                <tr>
                                                    <th>Foundry Id</th>
                                                    <th>Date Created</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                { this.currentFoundriesPage?.map((foundry, k) => (
                                                    <React.Fragment key={`${foundry?.foundryId}${k}`}>
                                                        <Foundry
                                                            key={k}
                                                            foundryId={foundry?.foundryId}
                                                            network={networkId}
                                                            dateCreated={foundry?.createdDate}
                                                            tableFormat={true}
                                                        />
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Only visible in mobile -- Card assets*/}
                                        <div className="transaction-cards">
                                            {this.currentFoundriesPage?.map((foundry, k) => (
                                                <React.Fragment key={`${foundry?.foundryId}${k}`}>
                                                    <Foundry
                                                        key={k}
                                                        foundryId={foundry?.foundryId}
                                                        network={networkId}
                                                        dateCreated={foundry?.createdDate}
                                                    />
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        <Pagination
                                            currentPage={this.state.foundriesPageNumber}
                                            totalCount={this.state.foundries?.length ?? 0}
                                            pageSize={Alias.FOUNDRIES_PAGE_SIZE}
                                            siblingsCount={1}
                                            onPageChange={page => this.setState({ foundriesPageNumber: page })}
                                        />
                                    </div>
                                )}
                                {this.state.output && (
                                    <AssetsTable networkId={networkId} outputs={[this.state.output]} />
                                )}
                            </div>
                        </div>
                    </div >
                </div >
            </div >
        );
    }

    private get currentFoundriesPage() {
        const from = (this.state.foundriesPageNumber - 1) * Alias.FOUNDRIES_PAGE_SIZE;
        const to = from + Alias.FOUNDRIES_PAGE_SIZE;

        return this.state.foundries?.slice(from, to);
    }

    private async getControlledFoundries() {
        if (!this.state.bech32AddressDetails?.bech32) {
            this.setState({ areFoundriesLoading: false });
            return;
        }
        const networkId = this.props.match.params.network;

        const foundries: IFoundryDetails[] = [];

        const foundryOutputs = await this._tangleCacheService.foundry({
            network: networkId,
            address: this.state.bech32AddressDetails?.bech32
        });

        if (foundryOutputs?.outputs && foundryOutputs?.outputs?.items.length > 0) {
            for (const outputId of foundryOutputs.outputs.items) {
                const outputDetails = await this._tangleCacheService.outputDetails(networkId, outputId);
                if (outputDetails?.output.type === FOUNDRY_OUTPUT_TYPE) {
                    foundries.push({
                        foundryId: this.state.bech32AddressDetails?.bech32.toString() + outputDetails?.output.serialNumber.toString() + outputDetails?.output.tokenScheme.type.toString()
                    });
                }
            }
        }

        this.setState({
            foundries,
            areFoundriesLoading: false
        });
    }

    /**
     * Load index and data from payload.
     * @returns Object with indexes and data in raw and utf-8 format.
     */
     private loadPayload() {
        let hexData;
        let utf8Data;
        let jsonData;

        if (this.state.output?.stateMetadata) {
            hexData = this.state.output?.stateMetadata;
            utf8Data = Converter.hexToUtf8(this.state.output?.stateMetadata);

            try {
                if (utf8Data) {
                    jsonData = JSON.stringify(JSON.parse(utf8Data), undefined, "  ");
                }
            } catch { }
        }
        return {
            utf8Data,
            hexData,
            jsonData
        };
    }
}

export default Alias;

