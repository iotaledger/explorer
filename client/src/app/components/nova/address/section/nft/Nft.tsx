import React from "react";
import { Link } from "react-router-dom";
import bigInt from "big-integer";
import {
    isSupportedImageFormat,
    noMetadataPlaceholder,
    nonStandardMetadataPlaceholder,
    unregisteredMetadataPlaceholder,
    unsupportedImageFormatPlaceholderCompact,
    getNftImageContent,
    loadingImagePlaceholderCompact,
} from "./NftMetadataUtils";
import nftSchemeIRC27 from "~assets/schemas/nft-schema-IRC27.json";
import { useNftMetadataUri } from "~helpers/stardust/hooks/useNftMetadataUri";
import { useTokenRegistryNftCheck } from "~helpers/stardust/hooks/useTokenRegistryNftCheck";
import { tryParseMetadata } from "~helpers/stardust/metadataUtils";
import { INftImmutableMetadata } from "~models/api/stardust/nft/INftImmutableMetadata";
import "./Nft.scss";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { NftAddress, NftOutput, Utils } from "@iota/sdk-wasm-nova/web";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import { TransactionsHelper } from "~/helpers/nova/transactionsHelper";
import { HexHelper } from "~/helpers/stardust/hexHelper";

export interface NftProps {
    /**
     * The nft output.
     */
    nftOutput: NftOutput;

    /**
     * The nft output id.
     */
    outputId: string;
}

const Nft: React.FC<NftProps> = ({ nftOutput, outputId }) => {
    const { name: network, bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);

    const metadata = TransactionsHelper.getNftMetadataFeature(nftOutput);
    const issuerId = TransactionsHelper.getNftIssuerId(nftOutput);
    const nftId = HexHelper.toBigInt256(nftOutput.nftId).eq(bigInt.zero) ? Utils.computeNftId(outputId) : nftOutput.nftId;
    const nftAddress = new NftAddress(nftId);
    const nftBech32Address = Utils.addressToBech32(nftAddress, bech32Hrp);

    let standardMetadata: INftImmutableMetadata | null = null;
    let name: string | null = null;
    if (metadata) {
        standardMetadata = tryParseMetadata<INftImmutableMetadata>(Object.values(metadata.entries)[0], nftSchemeIRC27);

        if (standardMetadata) {
            name = standardMetadata.name;
        }
    }

    const [isWhitelisted] = useTokenRegistryNftCheck(issuerId, nftId ?? nftOutput.nftId);
    const [uri, isNftUriLoading] = useNftMetadataUri(standardMetadata?.uri);

    const unsupportedFormatOrLoading = isNftUriLoading ? loadingImagePlaceholderCompact : unsupportedImageFormatPlaceholderCompact;

    const standardMetadataImageContent = isWhitelisted
        ? standardMetadata && uri && isSupportedImageFormat(standardMetadata.type)
            ? getNftImageContent(standardMetadata.type, uri, "nft-card__image")
            : unsupportedFormatOrLoading
        : unregisteredMetadataPlaceholder;

    const nftImageContent = metadata
        ? standardMetadata
            ? standardMetadataImageContent
            : nonStandardMetadataPlaceholder
        : noMetadataPlaceholder;

    return (
        <div className="nft-card">
            <div className="nft-card__metadata">
                <Link to={`/${network}/addr/${nftBech32Address}`}>{nftImageContent}</Link>
                <span className="nft-card__id">
                    <TruncatedId id={nftId} link={`/${network}/addr/${nftBech32Address}`} />
                </span>
            </div>
            {name && isWhitelisted && <span className="nft-card__name truncate">{name}</span>}
        </div>
    );
};

export default Nft;
