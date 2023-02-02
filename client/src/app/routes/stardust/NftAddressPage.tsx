import { HexEncodedString, IMetadataFeature, INftOutput, METADATA_FEATURE_TYPE } from "@iota/iota.js-stardust";
import { Converter, HexHelper } from "@iota/util.js-stardust";
import { optional } from "@ruffy/ts-optional";
import * as jsonschema from "jsonschema";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import mainMessage from "../../../assets/modals/stardust/nft/main-header.json";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { AsyncState } from "../../../helpers/promise/AsyncState";
import PromiseMonitor, { PromiseStatus } from "../../../helpers/promise/promiseMonitor";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { INftImmutableMetadata } from "../../../models/api/stardust/nft/INftImmutableMetadata";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import Modal from "../../components/Modal";
import NotFound from "../../components/NotFound";
import Spinner from "../../components/Spinner";
import AssetsTable from "../../components/stardust/AssetsTable";
import AssociatedOutputs from "../../components/stardust/AssociatedOutputs";
import Feature from "../../components/stardust/Feature";
import NftGeneralSection from "../../components/stardust/NftMetadataSection";
import NetworkContext from "../../context/NetworkContext";
import { NftRouteProps } from "../NftRouteProps";
import "./NftAddressPage.scss";
import nftSchemeIRC27 from "./../../../assets/schemas/nft-schema-IRC27.json";
import { NftState } from "./NftState";


/**
 * Component which will show the nft address page for stardust.
 */
class Nft extends AsyncComponent<RouteComponentProps<NftRouteProps>, NftState & AsyncState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * The component context.
     */
    public declare context: React.ContextType<typeof NetworkContext>;

    /**
     * API Client for tangle requests.
     */
    private readonly _tangleCacheService: StardustTangleCacheService;

    /**
     * Create a new instance of Nft.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<NftRouteProps>) {
        super(props);
        this._tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);

        this.state = {
            bech32AddressDetails: undefined,
            nftOutput: undefined,
            nftMetadata: undefined,
            jobToStatus: new Map<string, PromiseStatus>()
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
        const bech32Hrp: string = this.context.bech32Hrp;
        const network = this.props.match.params.network;
        const nftAddress = this.props.match.params.nftAddress;
        const nftAddressDetails = Bech32AddressHelper.buildAddress(bech32Hrp, nftAddress);

        const maybeNftId = optional(nftAddressDetails.hex);
        if (maybeNftId.isEmpty()) {
            this.setState({ nftError: "Bad Nft Id" });
        }

        optional(nftAddressDetails.hex).map(async nftId => {
            const nftLoadMonitor = new PromiseMonitor(status => {
                this.setState(prev => ({
                    ...prev, jobToStatus: this.state.jobToStatus.set("loadNftDetails", status)
                }));
            });

            // eslint-disable-next-line no-void
            void nftLoadMonitor.enqueue(
                async () => this._tangleCacheService.nftDetails({
                    network,
                    nftId: HexHelper.addPrefix(nftId)
                }).then(response => {
                    if (!response.error) {
                        window.scrollTo({
                            left: 0,
                            top: 0,
                            behavior: "smooth"
                        });

                        const nftOutput = response.nftDetails?.output as INftOutput;

                        const metadataFeature = nftOutput.immutableFeatures?.find(
                            feature => feature.type === METADATA_FEATURE_TYPE
                        ) as IMetadataFeature;
                        const nftMetadata = this.tryParseNftMetadata(metadataFeature.data);

                        this.setState({
                            bech32AddressDetails: nftAddressDetails,
                            nftOutput,
                            nftMetadata
                        });
                    } else {
                        this.setState({ nftError: response.error });
                    }
                })
            );
        });
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { bech32AddressDetails, nftOutput, nftError, jobToStatus, nftMetadata } = this.state;
        const { network, nftAddress } = this.props.match.params;
        const isLoading = Array.from(jobToStatus.values()).some(status => status !== PromiseStatus.DONE);

        if (nftError) {
            return (
                <div className="nft">
                    <div className="wrapper">
                        <div className="inner">
                            <div className="nft--header">
                                <div className="row middle">
                                    <h1>NFT Address</h1>
                                    <Modal icon="info" data={mainMessage} />
                                </div>
                            </div>
                            <NotFound
                                searchTarget="nft address"
                                query={nftAddress}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        const nftPageContent = !nftOutput ? null : (
            <React.Fragment>
                {/* <div className="section">
                    <div className="section--header">
                        <div className="row middle">
                            <h2>General</h2>
                        </div>
                    </div>
                    <div className="row space-between">
                        <Bech32Address
                            addressDetails={bech32AddressDetails}
                            advancedMode={true}
                        />
                    </div>
                </div> */}
                {(nftMetadata && bech32AddressDetails) && (
                    <NftGeneralSection
                        metadata={nftMetadata}
                        bech32AddressDetails={bech32AddressDetails}
                    />
                )}
                {optional(nftOutput?.features).nonEmpty() && (
                    <div className="section">
                        <div className="section--header row row--tablet-responsive middle space-between">
                            <div className="row middle">
                                <h2>Features</h2>
                            </div>
                        </div>
                        {nftOutput?.features?.map((feature, idx) => (
                            <Feature key={idx} feature={feature} isPreExpanded={true} isImmutable={false} />
                        ))}
                    </div>
                )}
                {optional(nftOutput?.immutableFeatures).nonEmpty() && (
                    <div className="section">
                        <div className="section--header row row--tablet-responsive middle space-between">
                            <div className="row middle">
                                <h2>Immutable features</h2>
                            </div>
                        </div>
                        {nftOutput?.immutableFeatures?.map((feature, idx) => (
                            <Feature key={idx} feature={feature} isPreExpanded={true} isImmutable={true} />
                        ))}
                    </div>
                )}
                {nftOutput && (
                    <AssetsTable networkId={network} outputs={[nftOutput]} />
                )}
                {bech32AddressDetails?.bech32 && (
                    <AssociatedOutputs
                        network={network}
                        addressDetails={bech32AddressDetails}
                        onAsyncStatusChange={() => { }}
                    />
                )}
            </React.Fragment>
        );

        return (
            <div className="nft">
                <div className="wrapper">
                    <div className="inner">
                        <div className="nft--header">
                            <div className="row middle">
                                <h1>NFT Address</h1>
                                <Modal icon="info" data={mainMessage} />
                                {isLoading && <Spinner />}
                            </div>
                        </div>
                        <div className="top">
                            <div className="sections">{nftPageContent}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Tries to parse hex data into NFT immutable metadata (tip-27).
     * @param metadataHex The encoded data.
     * @returns The parsed INftImmutableMetadata or undefined.
     */
    public tryParseNftMetadata(metadataHex: HexEncodedString): INftImmutableMetadata | undefined {
        const validator = new jsonschema.Validator();
        try {
            const json: unknown = JSON.parse(Converter.hexToUtf8(metadataHex));
            const result = validator.validate(json, nftSchemeIRC27);

            if (result.valid) {
                return json as INftImmutableMetadata;
            }
        } catch { }
    }
}

export default Nft;

