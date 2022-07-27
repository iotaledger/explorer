/* eslint-disable max-len */
/* eslint-disable camelcase */
import { INftOutput } from "@iota/iota.js-stardust";
import { HexHelper } from "@iota/util.js-stardust";
import { optional } from "@ruffy/ts-optional";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import AssetsTable from "../../components/stardust/AssetsTable";
import AssociatedOutputsTable from "../../components/stardust/AssociatedOutputsTable";
import Bech32Address from "../../components/stardust/Bech32Address";
import Feature from "../../components/stardust/Feature";
import NetworkContext from "../../context/NetworkContext";
import { NftRouteProps } from "../NftRouteProps";
import "./Nft.scss";
import { NftState } from "./NftState";

/**
 * Component which will show the nft address page for stardust.
 */
class Nft extends AsyncComponent<RouteComponentProps<NftRouteProps>, NftState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

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
            output: undefined
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
        const bech32Hrp = this.context.bech32Hrp;
        const network = this.props.match.params.network;
        const nftAddress = this.props.match.params.nftAddress;
        const nftAddressDetails = Bech32AddressHelper.buildAddress(bech32Hrp, nftAddress);

        optional(nftAddressDetails.hex).map(async nftId => {
            const response = await this._tangleCacheService.nftDetails({
                network,
                nftId: HexHelper.addPrefix(nftId)
            });

            if (response) {
                window.scrollTo({
                    left: 0,
                    top: 0,
                    behavior: "smooth"
                });

                const output = response.nftDetails?.output as INftOutput;

                this.setState({
                    bech32AddressDetails: nftAddressDetails,
                    output
                });
            } else {
                this.props.history.replace(`/${network}/search/${nftId}`);
            }
        });
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { bech32AddressDetails, output } = this.state;
        const networkId = this.props.match.params.network;

        return (
            <div className="nft">
                <div className="wrapper">
                    <div className="inner">
                        <div className="nft--header">
                            <div className="row middle">
                                <h1>NFT Address</h1>
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
                                    <div className="row space-between general-content">
                                        <Bech32Address
                                            addressDetails={bech32AddressDetails}
                                            advancedMode={true}
                                        />
                                    </div>
                                </div>

                                {optional(output?.features).nonEmpty() && (
                                    <div className="section">
                                        <div className="section--header row row--tablet-responsive middle space-between">
                                            <div className="row middle">
                                                <h2>Features</h2>
                                            </div>
                                        </div>
                                        {output?.features?.map((feature, idx) => (
                                            <Feature key={idx} feature={feature} isPreExpanded={true} isImmutable={false} />
                                        ))}
                                    </div>
                                )}

                                {optional(output?.immutableFeatures).nonEmpty() && (
                                    <div className="section">
                                        <div className="section--header row row--tablet-responsive middle space-between">
                                            <div className="row middle">
                                                <h2>Immutable features</h2>
                                            </div>
                                        </div>
                                        {output?.immutableFeatures?.map((feature, idx) => (
                                            <Feature key={idx} feature={feature} isPreExpanded={true} isImmutable={true} />
                                        ))}
                                    </div>
                                )}

                                {output && (
                                    <AssetsTable networkId={networkId} outputs={[output]} />
                                )}
                                {bech32AddressDetails?.bech32 && (
                                    <AssociatedOutputsTable
                                        network={networkId}
                                        addressDetails={bech32AddressDetails}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Nft;

