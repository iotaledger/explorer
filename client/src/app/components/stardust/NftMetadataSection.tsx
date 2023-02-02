import classNames from "classnames";
import React, { useState } from "react";
import { ReactComponent as DropdownIcon } from "../../../assets/dropdown-arrow.svg";
import metadataMissingPlaceholder from "../../../assets/stardust/missing-nft-metadata.png";
import unsupportedFormatPlaceholder from "../../../assets/stardust/unsupported-format.png";
import { IBech32AddressDetails } from "../../../models/api/IBech32AddressDetails";
import { INftImmutableMetadata } from "../../../models/api/stardust/nft/INftImmutableMetadata";
import JsonViewer from "../JsonViewer";
import "./NftMetadataSection.scss";

/**
 * Supported image MIME formats.
 */
const SUPPORTED_IMAGE_FORMATS = new Set(["image/jpeg", "image/png", "image/gif"]);

interface NftGeneralSectionProps {
    /**
     * NFT Metadata
     */
    bech32AddressDetails: IBech32AddressDetails;
    /**
     * NFT Metadata
     */
    metadata: INftImmutableMetadata;
}

const NftGeneralSection: React.FC<NftGeneralSectionProps> = ({ metadata, bech32AddressDetails }) => {
    const [showGeneral, setShowGeneral] = useState<boolean>(true);
    const [showRoyalties, setShowRoyalties] = useState<boolean>(false);
    const [showAttributes, setShowAttributes] = useState<boolean>(false);
    const [showDescription, setShowDescription] = useState<boolean>(false);

    const nftImage = !metadata ? (
        <img
            className="nft-metadata__image"
            src={metadataMissingPlaceholder}
        />
    ) : (isSupportedImageFormat(metadata.type) ? (
        <img
            className="nft-metadata__image"
            src={metadata?.uri}
            alt="bundle"
        />
    ) : (
        <img
            className="nft-metadata__image"
            src={unsupportedFormatPlaceholder}
        />
    ));

    return (

        <div className="section">
            <div className="section--data nft-metadata">
                {nftImage}
                <div className="col w100 margin-l-m">
                    <div
                        className="row pointer"
                        onClick={() =>
                            setShowGeneral(!showGeneral)}
                    >
                        <div className={classNames("card--content--dropdown", "margin-r-t",
                            { opened: showGeneral })}
                        >
                            <DropdownIcon />
                        </div>
                        <h2>General</h2>
                    </div>
                    {
                    showGeneral &&
                        <ul>
                            <li className="row space-between margin-t-t">
                                <span className="label">Nft Address</span>
                                <span className="value">
                                    {bech32AddressDetails.bech32}
                                </span>
                            </li>
                            <li className="row space-between margin-t-t">
                                <span className="label">Nft Id</span>
                                <span className="value">
                                    {bech32AddressDetails.hex}
                                </span>
                            </li>
                            <li className="row space-between margin-t-t">
                                <span className="label">Name</span>
                                <span className="value">
                                    {metadata.name}
                                </span>
                            </li>
                            <li className="row space-between margin-t-t">
                                <span className="label">Token Standard</span>
                                <span className="value">
                                    {metadata.standard}
                                </span>
                            </li>
                            <li className="row space-between margin-t-t">
                                <span className="label">Version</span>
                                <span className="value">
                                    {metadata.version}
                                </span>
                            </li>
                            <li className="row space-between margin-t-t">
                                <span className="label">Type</span>
                                <span className="value">
                                    {metadata.type}
                                </span>
                            </li>
                            {
                            metadata.collectionName &&
                                <li className="row space-between margin-t-t">
                                    <span className="label">Collection Name</span>
                                    <span className="value">
                                        {metadata.collectionName}
                                    </span>
                                </li>
                            }
                            {
                            metadata.issuerName &&
                                <li className="row space-between margin-t-t">
                                    <span className="label">Issuer Name</span>
                                    <span className="value">
                                        {metadata.issuerName}
                                    </span>
                                </li>
                            }
                        </ul>
                    }
                    {
                    metadata.royalties &&
                        <React.Fragment>
                            <div
                                className="row pointer margin-t-s"
                                onClick={() =>
                                    setShowRoyalties(!showRoyalties)}
                            >
                                <div className={classNames("card--content--dropdown", "margin-r-t",
                                    { opened: showRoyalties })}
                                >
                                    <DropdownIcon />
                                </div>
                                <h2>Royalties</h2>
                            </div>
                            {
                            showRoyalties &&
                                <div className="data-toggle margin-t-s">
                                    <div className="data-toggle--content">
                                        <JsonViewer
                                            json={JSON.stringify(metadata.royalties, undefined, "  ")}
                                        />
                                    </div>
                                </div>
                            }
                        </React.Fragment>
                    }
                    {
                    metadata.attributes &&
                        <React.Fragment>
                            <div
                                className="row pointer margin-t-s"
                                onClick={() =>
                                    setShowAttributes(!showAttributes)}
                            >
                                <div className={classNames("card--content--dropdown", "margin-r-t",
                                    { opened: showAttributes })}
                                >
                                    <DropdownIcon />
                                </div>
                                <h2>Attributes</h2>
                            </div>
                            {
                            showAttributes &&
                                <div className="data-toggle margin-t-s">
                                    <div className="data-toggle--content">
                                        <JsonViewer
                                            json={JSON.stringify(metadata.attributes, undefined, "  ")}
                                        />
                                    </div>
                                </div>
                            }
                        </React.Fragment>
                    }
                    {
                    metadata.description &&
                        <React.Fragment>
                            <div
                                className="row pointer margin-t-s"
                                onClick={() =>
                                    setShowDescription(!showDescription)}
                            >
                                <div className={classNames("card--content--dropdown", "margin-r-t",
                                    { opened: showDescription })}
                                >
                                    <DropdownIcon />
                                </div>
                                <h2>Description</h2>
                            </div>
                            {
                            showDescription &&
                                <span className="value margin-t-s">
                                    {metadata.description}
                                </span>
                            }
                        </React.Fragment>
                    }
                </div>
            </div>
        </div>
    );
};

/**
 * Validate NFT image MIME type.
 * @param nftType The NFT image MIME type.
 * @returns A bool.
 */
function isSupportedImageFormat(nftType: string | undefined): boolean {
    if (nftType === undefined) {
        return false;
    }

    return SUPPORTED_IMAGE_FORMATS.has(nftType);
}

export default NftGeneralSection;
