/* eslint-disable max-len */
/* eslint-disable camelcase */
import { ALIAS_ADDRESS_TYPE, FOUNDRY_OUTPUT_TYPE, IAliasOutput } from "@iota/iota.js-stardust";
import { HexHelper, WriteStream } from "@iota/util.js-stardust";
import { optional } from "@ruffy/ts-optional";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { TransactionsHelper } from "../../../helpers/stardust/transactionsHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import CopyButton from "../../components/CopyButton";
import DataToggle from "../../components/DataToggle";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import AssetsTable from "../../components/stardust/AssetsTable";
import AssociatedOutputsTable from "../../components/stardust/AssociatedOutputsTable";
import Bech32Address from "../../components/stardust/Bech32Address";
import ControlledFoundry from "../../components/stardust/ControlledFoundry";
import NetworkContext from "../../context/NetworkContext";
import { AliasRouteProps } from "../AliasRouteProps";
import foundriesMessage from "./../../../assets/modals/stardust/alias/foundries.json";
import mainMessage from "./../../../assets/modals/stardust/alias/main-header.json";
import stateMessage from "./../../../assets/modals/stardust/alias/state.json";
import Modal from "./../../components/Modal";
import { AliasState } from "./AliasState";
import "./AddressPage.scss";

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
     * The component context.
     */
    public declare context: React.ContextType<typeof NetworkContext>;

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
            isFormatStorageRentFull: true
        };
    }

    private get currentFoundriesPage() {
        const from = (this.state.foundriesPageNumber - 1) * Alias.FOUNDRIES_PAGE_SIZE;
        const to = from + Alias.FOUNDRIES_PAGE_SIZE;

        return this.state.foundries?.slice(from, to);
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
        const bech32Hrp: string = this.context.bech32Hrp;
        const networkId = this.props.match.params.network;
        const aliasAddress: string = this.props.match.params.aliasAddress;
        const aliasAddressDetails = Bech32AddressHelper.buildAddress(bech32Hrp, aliasAddress);

        optional(aliasAddressDetails.hex).map(async aliasId => {
            const response = await this._tangleCacheService.aliasDetails({
                network: networkId,
                aliasId: HexHelper.addPrefix(aliasId)
            });
            if (response) {
                window.scrollTo({
                    left: 0,
                    top: 0,
                    behavior: "smooth"
                });

                const output = response.aliasDetails?.output as IAliasOutput;

                this.setState({
                    bech32AddressDetails: aliasAddressDetails,
                    output,
                    stateMetadataHex: output.stateMetadata
                }, async () => {
                    await this.getControlledFoundries();
                });
            } else {
                this.props.history.replace(`/${networkId}/search/${aliasAddress}`);
            }
        });
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const {
            bech32AddressDetails, storageRentBalance, areFoundriesLoading,
            foundries, foundriesPageNumber, output, stateMetadataHex, isFormatStorageRentFull
        } = this.state;
        const { tokenInfo } = this.context;
        const networkId = this.props.match.params.network;
        const hasFoundries = foundries && foundries.length > 0;

        return (
            <div className="addr">
                <div className="wrapper">
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>Alias</h1>
                                <Modal icon="info" data={mainMessage} />
                            </div>
                        </div>
                        <div className="top">
                            <div className="sections">
                                <div className="section">
                                    <div className="section--header">
                                        <div className="row middle">
                                            <h2>General</h2>
                                        </div>
                                    </div>
                                    <div className="row space-between">
                                        <div className="section--data">
                                            <Bech32Address
                                                addressDetails={bech32AddressDetails}
                                                advancedMode={true}
                                            />
                                        </div>
                                    </div>
                                    {storageRentBalance && (
                                        <div className="section--data margin-t-m">
                                            <div className="label">
                                                Storage deposit
                                            </div>
                                            <div className="row middle value featured">
                                                <span
                                                    onClick={() => this.setState({ isFormatStorageRentFull: !isFormatStorageRentFull })}
                                                    className="pointer margin-r-5"
                                                >
                                                    {formatAmount(storageRentBalance, tokenInfo, isFormatStorageRentFull)}
                                                </span>
                                                <CopyButton copy={String(storageRentBalance)} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="section">
                                    <div className="section--header">
                                        <div className="row middle">
                                            <h2>State</h2>
                                            <Modal icon="info" data={stateMessage} />
                                        </div>
                                    </div>
                                    <div className="section--data">
                                        <div>
                                            <div className="label">State Index</div>
                                            <div className="value row middle margin-t-t">
                                                <span className="margin-r-t">{output?.stateIndex}</span>
                                            </div>
                                        </div>
                                        {stateMetadataHex && (
                                            <div>
                                                <div className="label margin-t-m">State Metadata</div>
                                                <div className="value row middle margin-t-t">
                                                    <DataToggle
                                                        sourceData={stateMetadataHex}
                                                        withSpacedHex={true}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {areFoundriesLoading && (
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
                                                    Controlled foundries ({foundries?.length})
                                                </h2>
                                                <Modal icon="info" data={foundriesMessage} />
                                            </div>
                                        </div>
                                        <table className="controlled-foundry--table">
                                            <thead>
                                                <tr>
                                                    <th>Foundry Id</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.currentFoundriesPage?.map((foundry, k) => (
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
                                        <div className="controlled-foundry--cards">
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
                                            currentPage={foundriesPageNumber}
                                            totalCount={foundries?.length ?? 0}
                                            pageSize={Alias.FOUNDRIES_PAGE_SIZE}
                                            siblingsCount={1}
                                            onPageChange={page => this.setState({ foundriesPageNumber: page })}
                                        />
                                    </div>
                                )}
                                {output && (
                                    <AssetsTable networkId={networkId} outputs={[output]} />
                                )}
                                {bech32AddressDetails?.bech32 && (
                                    <AssociatedOutputsTable
                                        network={networkId}
                                        addressDetails={bech32AddressDetails}
                                        onAsyncStatusChange={() => { }}
                                    />
                                )}
                            </div>
                        </div>
                    </div >
                </div >
            </div >
        );
    }

    private async getControlledFoundries() {
        if (!this.state.bech32AddressDetails?.bech32 || !this.state.bech32AddressDetails.hex) {
            this.setState({ areFoundriesLoading: false });
            return;
        }

        const { rentStructure } = this.context;
        const networkId = this.props.match.params.network;
        const foundries: { foundryId: string }[] = [];
        let storageRentBalance: number | undefined;

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

                    // accumulate storage rent
                    storageRentBalance = TransactionsHelper.computeStorageRentBalance(
                        [outputDetails.output],
                        rentStructure
                    ) + (storageRentBalance ?? 0);

                    foundries.push({ foundryId });
                }
            }
        }

        this.setState({
            foundries,
            storageRentBalance,
            areFoundriesLoading: false
        });
    }

    /**
     * Build a FoundryId from aliasAddres, serialNumber and tokenSchemeType
     * @param aliasId The id of the Alias that controls the Foundry.
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

        return `${aliasAddress}${serialNumberHex}${tokenSchemeTypeHex}`;
    }
}

export default Alias;

