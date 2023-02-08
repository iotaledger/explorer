/* eslint-disable max-len */
/* eslint-disable camelcase */
import { FOUNDRY_OUTPUT_TYPE, IAliasOutput, TransactionHelper } from "@iota/iota.js-stardust";
import { HexHelper } from "@iota/util.js-stardust";
import { optional } from "@ruffy/ts-optional";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { AsyncState } from "../../../helpers/promise/AsyncState";
import PromiseMonitor, { PromiseStatus } from "../../../helpers/promise/promiseMonitor";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { TransactionsHelper } from "../../../helpers/stardust/transactionsHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { IBech32AddressDetails } from "../../../models/api/IBech32AddressDetails";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import CopyButton from "../../components/CopyButton";
import DataToggle from "../../components/DataToggle";
import NotFound from "../../components/NotFound";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import AssetsTable from "../../components/stardust/AssetsTable";
import AssociatedOutputs from "../../components/stardust/AssociatedOutputs";
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
class Alias extends AsyncComponent<RouteComponentProps<AliasRouteProps>, AliasState & AsyncState> {
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
            foundries: [],
            foundriesPageNumber: 1,
            isFormatStorageRentFull: true,
            jobToStatus: new Map<string, PromiseStatus>()
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
        const { network, aliasAddress } = this.props.match.params;
        const aliasAddressDetails = Bech32AddressHelper.buildAddress(bech32Hrp, aliasAddress);

        window.scrollTo({
            left: 0,
            top: 0,
            behavior: "smooth"
        });

        const maybeAliasId = optional(aliasAddressDetails.hex);
        if (maybeAliasId.isEmpty()) {
            this.setState({ aliasError: "Bad Alias Id" });
        }

        maybeAliasId.foreach(async aliasId => {
            const aliasLoadMonitor = new PromiseMonitor(status => {
                this.setState(prev => ({
                    ...prev, jobToStatus: this.state.jobToStatus.set("loadAliasDetails", status)
                }));
            });

            // eslint-disable-next-line no-void
            void aliasLoadMonitor.enqueue(
                async () => this._tangleCacheService.aliasDetails({
                    network,
                    aliasId: HexHelper.addPrefix(aliasId)
                }).then(response => {
                    if (!response.error) {
                        const aliasOutput = response.aliasDetails?.output as IAliasOutput;

                        this.setState({
                            bech32AddressDetails: aliasAddressDetails,
                            aliasOutput,
                            stateMetadataHex: aliasOutput.stateMetadata
                        });
                    } else {
                        this.setState({ aliasError: response.error });
                    }
                })
            );

            // eslint-disable-next-line no-void
            void this.getControlledFoundries(aliasAddressDetails);
        });
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const {
            bech32AddressDetails, storageRentBalance, foundries, foundriesPageNumber,
            aliasOutput, aliasError, stateMetadataHex, isFormatStorageRentFull, jobToStatus
        } = this.state;
        const { tokenInfo } = this.context;
        const { network, aliasAddress } = this.props.match.params;
        const hasFoundries = foundries && foundries.length > 0;
        const isLoading = Array.from(jobToStatus.values()).some(status => status !== PromiseStatus.DONE);
        const areFoundriesLoading = jobToStatus.get("aliasFoundriesDetails") !== PromiseStatus.DONE;

        if (aliasError) {
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
                            <NotFound
                                searchTarget="alias"
                                query={aliasAddress}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        const aliasPageContent = (!bech32AddressDetails || !aliasOutput) ? null : (
            <React.Fragment>
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
                                <span className="margin-r-t">{aliasOutput?.stateIndex}</span>
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
                                            network={network}
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
                                        network={network}
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
                {aliasOutput && (
                    <AssetsTable networkId={network} outputs={[aliasOutput]} />
                )}
                {bech32AddressDetails?.bech32 && (
                    <AssociatedOutputs
                        network={network}
                        addressDetails={bech32AddressDetails}
                        setIsLoading={() => { }}
                    />
                )}
            </React.Fragment>

        );

        return (
            <div className="addr">
                <div className="wrapper">
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>Alias</h1>
                                <Modal icon="info" data={mainMessage} />
                                {isLoading && <Spinner />}
                            </div>
                        </div>
                        <div className="top">
                            <div className="sections">{aliasPageContent}</div>
                        </div>
                    </div >
                </div >
            </div >
        );
    }

    private async getControlledFoundries(bech32AddressDetails: IBech32AddressDetails): Promise<void> {
        if (!bech32AddressDetails?.bech32 || !bech32AddressDetails.hex) {
            return;
        }

        const foundriesLoadMonitor = new PromiseMonitor(status => {
            this.setState(prev => ({
                ...prev, jobToStatus: this.state.jobToStatus.set("aliasFoundriesDetails", status)
            }));
        });

        const { rentStructure } = this.context;
        const networkId = this.props.match.params.network;
        const foundries: { foundryId: string }[] = [];
        let storageRentBalance: number | undefined;
        const aliasId = bech32AddressDetails.hex;

        // eslint-disable-next-line no-void
        void foundriesLoadMonitor.enqueue(
            async () => this._tangleCacheService.foundriesByAliasAddress({
                network: networkId,
                aliasAddress: bech32AddressDetails?.bech32
            }).then(async foundryOutputs => {
                if (foundryOutputs?.foundryOutputsResponse && foundryOutputs?.foundryOutputsResponse?.items.length > 0) {
                    for (const foundryOutputId of foundryOutputs.foundryOutputsResponse.items) {
                        // eslint-disable-next-line no-void
                        void foundriesLoadMonitor.enqueue(
                            async () => this._tangleCacheService.outputDetails(networkId, foundryOutputId).then(
                                response => {
                                    if (!response.error && response.output?.type === FOUNDRY_OUTPUT_TYPE) {
                                        const output = response.output;
                                        const serialNumber = output.serialNumber;
                                        const tokenSchemeType = output.tokenScheme.type;
                                        const foundryId = TransactionHelper.constructTokenId(
                                            aliasId,
                                            serialNumber,
                                            tokenSchemeType
                                        );

                                        // accumulate storage rent
                                        storageRentBalance = TransactionsHelper.computeStorageRentBalance(
                                            [output],
                                            rentStructure
                                        ) + (storageRentBalance ?? 0);

                                        foundries.push({ foundryId });
                                    }
                                }
                            )
                        );
                    }
                }

                this.setState({
                    foundries,
                    storageRentBalance
                });
            })
        );
    }
}

export default Alias;

