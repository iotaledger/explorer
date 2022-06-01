/* eslint-disable max-len */
/* eslint-disable camelcase */
import { NFT_ADDRESS_TYPE, NFT_OUTPUT_TYPE } from "@iota/iota.js-stardust";
import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { STARDUST } from "../../../models/db/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import AsyncComponent from "../../components/AsyncComponent";
import CopyButton from "../../components/CopyButton";
import AssetsTable from "../../components/stardust/AssetsTable";
import Bech32Address from "../../components/stardust/Bech32Address";
import NetworkContext from "../../context/NetworkContext";
import { NftRouteProps } from "../NftRouteProps";
import "./AddressPage.scss";
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
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
        const bech32Hrp = this.context.bech32Hrp;
        const networkId = this.props.match.params.network;
        const nftId = this.props.match.params.nftId;

        const result = await this._tangleCacheService.outputDetails(networkId, nftId);

        if (result?.output?.type === NFT_OUTPUT_TYPE) {
            window.scrollTo({
                left: 0,
                top: 0,
                behavior: "smooth"
            });

            const bech32AddressDetails = Bech32AddressHelper.buildAddress(
                    bech32Hrp,
                    result.output.nftId,
                    NFT_ADDRESS_TYPE);
            this.setState({
                bech32AddressDetails,
                output: result.output
            });
        } else {
            this.props.history.replace(`/${networkId}/search/${nftId}`);
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const networkId = this.props.match.params.network;

        return (
            <div className="addr">
                <div className="wrapper">
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>
                                    NFT Address
                                </h1>
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
                                                addressDetails={this.state?.bech32AddressDetails}
                                                advancedMode={true}
                                            />
                                            <div className="label">
                                                NFT ID
                                            </div>
                                            <div className="value row middle code">
                                                <span className="margin-r-t">
                                                    {this.state?.bech32AddressDetails?.hex}
                                                </span>
                                                <CopyButton
                                                    onClick={() => ClipboardHelper.copy(
                                                        this.state.bech32AddressDetails?.hex
                                                    )}
                                                    buttonType="copy"
                                                    labelPosition="top"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {this.state?.output && (
                                    <AssetsTable networkId={networkId} outputs={[this.state?.output]} />
                                )}
                            </div>
                        </div>
                    </div >
                </div >
            </div >
        );
    }
}

export default Nft;

