/* eslint-disable max-len */
/* eslint-disable camelcase */
import { ALIAS_ADDRESS_TYPE, ALIAS_OUTPUT_TYPE, FOUNDRY_OUTPUT_TYPE } from "@iota/iota.js-stardust";
import { Converter, HexHelper, WriteStream } from "@iota/util.js-stardust";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { STARDUST } from "../../../models/db/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import CopyButton from "../../components/CopyButton";
import DataToggle from "../../components/DataToggle";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import AssetsTable from "../../components/stardust/AssetsTable";
import Bech32Address from "../../components/stardust/Bech32Address";
import ControlledFoundry from "../../components/stardust/ControlledFoundry";
import NetworkContext from "../../context/NetworkContext";
import { AliasRouteProps } from "../AliasRouteProps";
import mainHeaderMessage from "./../../../assets/modals/address/main-header.json";
import Modal from "./../../components/Modal";
import "./AddressPage.scss";
import { AliasState } from "./AliasState";

/**
 * Component which will show the alias page for stardust.
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
     * Create a new instance of Addr.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<AliasRouteProps>) {
        super(props);
        this._tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);
        this.state = {
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
        const bech32Hrp = this.context.bech32Hrp;
        const networkId = this.props.match.params.network;
        const aliasId = this.props.match.params.aliasId;

        const result = await this._tangleCacheService.outputDetails(networkId, aliasId);

        if (result?.output?.type === ALIAS_OUTPUT_TYPE) {
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: "smooth"
            });

            const bech32AddressDetails = Bech32AddressHelper.buildAddress(
                    bech32Hrp,
                    result.output.aliasId,
                    ALIAS_ADDRESS_TYPE);
            this.setState(this.loadPayload());
            this.setState({
                bech32AddressDetails,
                output: result.output
            }, async () => {
                await this.getControlledFoundries();
            });
        } else {
            this.props.history.replace(`/${networkId}/search/${aliasId}`);
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
                label: this.state.stateMetadataJson ? "JSON" : "Text",
                content: this.state.stateMetadataJson ?? this.state.stateMetadataUtf8,
                isJson: this.state.stateMetadataJson !== undefined
            },
            {
                label: "HEX",
                content: this.state.stateMetadataHex
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
                                                Index
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
                                                </tr>
                                            </thead>
                                            <tbody>
                                                { this.currentFoundriesPage?.map((foundry, k) => (
                                                    <React.Fragment key={`${foundry?.foundryId}${k}`}>
                                                        <ControlledFoundry
                                                            key={k}
                                                            foundryId={foundry?.foundryId}
                                                            network={networkId}
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
                                                    <ControlledFoundry
                                                        key={k}
                                                        foundryId={foundry?.foundryId}
                                                        network={networkId}
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
        if (!this.state.bech32AddressDetails?.bech32 || !this.state.bech32AddressDetails.hex) {
            this.setState({ areFoundriesLoading: false });
            return;
        }

        const networkId = this.props.match.params.network;
        const foundries: { foundryId: string }[] = [];

        const foundryOutputs = await this._tangleCacheService.foundriesByAliasAddress({
            network: networkId,
            aliasAddress: this.state.bech32AddressDetails?.bech32
        });

        if (foundryOutputs?.foundryOutputsResponse && foundryOutputs?.foundryOutputsResponse?.items.length > 0) {
            for (const foundryOutputId of foundryOutputs.foundryOutputsResponse.items) {
                const outputDetails = await this._tangleCacheService.outputDetails(networkId, foundryOutputId);

                if (outputDetails?.output.type === FOUNDRY_OUTPUT_TYPE) {
                    const aliasId = this.state.bech32AddressDetails.hex;
                    const serialNumber = outputDetails.output.serialNumber;
                    const tokenSchemeType = outputDetails.output.tokenScheme.type;

                    const foundryId = this.buildFoundyId(aliasId, serialNumber, tokenSchemeType);

                    foundries.push({ foundryId });
                }
            }
        }

        this.setState({
            foundries,
            areFoundriesLoading: false
        });
    }

    /**
     * Build a FoundryId from aliasAddres, serialNumber and tokenSchemeType
     * @param aliasAddress The Alias address that controls the Foundry.
     * @param serialNumber The serial number of the Foundry.
     * @param tokenSchemeType The token scheme type of the Foundry.
     * @returns The FoundryId string.
     */
    private buildFoundyId(aliasId: string, serialNumber: number, tokenSchemeType: number) {
        const typeWS = new WriteStream();
        typeWS.writeUInt8("alias address type", ALIAS_ADDRESS_TYPE);
        const aliasAddress = HexHelper.addPrefix(
            `${typeWS.finalHex()}${HexHelper.stripPrefix(aliasId)}`
        );
        const serialNumberWS = new WriteStream();
        serialNumberWS.writeUInt32("serialNumber", serialNumber);
        const serialNumberHex = serialNumberWS.finalHex();
        const tokenSchemeTypeWS = new WriteStream();
        tokenSchemeTypeWS.writeUInt8("tokenSchemeType", tokenSchemeType);
        const tokenSchemeTypeHex = tokenSchemeTypeWS.finalHex();

        return `${aliasAddress}${serialNumberHex}${tokenSchemeTypeHex}`
    }

    /**
     * Load index and data from payload.
     * @returns Object with indexes and data in raw and utf-8 format.
     */
     private loadPayload() {
        let stateMetadataHex;
        let stateMetadataUtf8;
        let stateMetadataJson;

        if (this.state.output?.stateMetadata) {
            stateMetadataHex = this.state.output?.stateMetadata;
            stateMetadataUtf8 = Converter.hexToUtf8(this.state.output?.stateMetadata);

            try {
                if (stateMetadataUtf8) {
                    stateMetadataJson = JSON.stringify(JSON.parse(stateMetadataUtf8), undefined, "  ");
                }
            } catch { }
        }
        return {
            stateMetadataUtf8,
            stateMetadataHex,
            stateMetadataJson
        };
    }
}

export default Alias;

