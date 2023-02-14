import {
    IIssuerFeature,
    IMetadataFeature, INftOutput,
    IOutputResponse, ISSUER_FEATURE_TYPE,
    METADATA_FEATURE_TYPE,
    NFT_OUTPUT_TYPE,
    TransactionHelper
} from "@iota/iota.js-stardust";
import { useEffect, useState } from "react";
import { INftBase, tryParseNftMetadata } from "../nftHelper";
import { TransactionsHelper } from "../transactionsHelper";

export enum NFTFilter {
    ALL,
    COLLECTION,
    WITH_IMM_METADATA
}

/**
 *
 * @param outputResponse
 */
export function parseNFTOutput(outputResponse: IOutputResponse) {
    const outputId = TransactionHelper.outputIdFromTransactionData(
        outputResponse.metadata.transactionId,
        outputResponse.metadata.outputIndex
    );

    const nftOutput = outputResponse.output as INftOutput;
    const nftId = TransactionsHelper.buildIdHashForAliasOrNft(nftOutput.nftId, outputId);
    const metadataFeature = nftOutput.immutableFeatures?.find(
        feature => feature.type === METADATA_FEATURE_TYPE
    ) as IMetadataFeature;
    const issuerFeature = nftOutput.immutableFeatures?.find(
        feature => feature.type === ISSUER_FEATURE_TYPE
    ) as IIssuerFeature;

    const parsedMetadata = metadataFeature ? tryParseNftMetadata(metadataFeature.data) : undefined;
    return { nftId, metadataFeature, issuerFeature, parsedMetadata };
}

/**
 *
 * @param mounted
 * @param outputs
 * @param network
 * @param bech32Address
 * @param onlyCollectionNFTs
 * @param filter
 */
export function useNFTs(
    mounted: React.MutableRefObject<boolean>, outputs: IOutputResponse[],
    network: string, bech32Address: string, filter: NFTFilter = NFTFilter.ALL
): INftBase[] {
    const [nfts, setNFTs] = useState<INftBase[]>([]);
    const theNfts: INftBase[] = [];

    const unmount = () => {
        mounted.current = false;
    };
    useEffect(() => {
        mounted.current = true;

        if (!outputs) {
            return unmount;
        }

        for (const outputResponse of outputs) {
            if (
                outputResponse &&
                !outputResponse.metadata.isSpent &&
                outputResponse.output.type === NFT_OUTPUT_TYPE
            ) {
                const { nftId, metadataFeature, parsedMetadata } = parseNFTOutput(outputResponse);

                if (
                    (filter === NFTFilter.COLLECTION || filter === NFTFilter.WITH_IMM_METADATA) &&
                    !metadataFeature
                ) {
                    // eslint-disable-next-line no-continue
                    continue;
                }

                if (filter === NFTFilter.COLLECTION && !parsedMetadata?.collectionName) {
                    // eslint-disable-next-line no-continue
                    continue;
                }

                theNfts.push({ id: nftId, metadata: parsedMetadata });
            }
        }

        if (mounted.current) {
            setNFTs(theNfts);
        }

        return unmount;
    }, [outputs, network, bech32Address]);

    return nfts;
}
