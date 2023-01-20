import {
    HexEncodedString, IMetadataFeature, IOutputResponse, METADATA_FEATURE_TYPE, NFT_OUTPUT_TYPE, TransactionHelper
} from "@iota/iota.js-stardust";
import { Converter } from "@iota/util.js-stardust";
import * as jsonschema from "jsonschema";
import React, { useEffect, useRef, useState } from "react";
import { TransactionsHelper } from "../../../helpers/stardust/transactionsHelper";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import Nft from "../../components/stardust/Nft";
import nftsMessage from "./../../../assets/modals/stardust/address/nfts-in-wallet.json";
import nftSchemeIRC27 from "./../../../assets/schemas/nft-schema-IRC27.json";

interface NftSectionProps {
    network: string;
    bech32Address?: string;
    outputs: IOutputResponse[] | undefined;
    setNftCount?: React.Dispatch<React.SetStateAction<number>>;
}

interface INftBase {
    id: string;
    metadata?: INftImmutableMetadata;
}

export interface INftImmutableMetadata {
    standard: "IRC27";
    version: string;
    type: string;
    uri: string;
    name: string;
    collectionName?: string;
    royalities?: Record<string, unknown>;
    issuerName?: string;
    description?: string;
    attributes?: [];
    error?: string;
}

const PAGE_SIZE = 10;

const NftSection: React.FC<NftSectionProps> = ({ network, bech32Address, outputs, setNftCount }) => {
    const mounted = useRef(false);
    const [nfts, setNfts] = useState<INftBase[]>([]);
    const [page, setPage] = useState<INftBase[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);

    const unmount = () => {
        mounted.current = false;
    };

    useEffect(() => {
        mounted.current = true;
        const theNfts: INftBase[] = [];

        if (outputs) {
            for (const outputResponse of outputs) {
                if (
                    outputResponse &&
                    !outputResponse.metadata.isSpent &&
                    outputResponse.output.type === NFT_OUTPUT_TYPE
                ) {
                    const outputId = TransactionHelper.outputIdFromTransactionData(
                        outputResponse.metadata.transactionId,
                        outputResponse.metadata.outputIndex
                    );

                    const nftOutput = outputResponse.output;
                    const nftId = TransactionsHelper.buildIdHashForAliasOrNft(nftOutput.nftId, outputId);
                    const metadataFeature = nftOutput.immutableFeatures?.find(
                        feature => feature.type === METADATA_FEATURE_TYPE
                    ) as IMetadataFeature;

                    theNfts.push({
                        id: nftId,
                        metadata: metadataFeature ? tryParseNftMetadata(metadataFeature.data) : undefined
                    });
                }
            }
        }

        if (mounted.current) {
            setNfts(theNfts);

            if (setNftCount) {
                setNftCount(theNfts.length);
            }
        }

        return unmount;
    }, [outputs, network, bech32Address]);

    // On page change handler
    useEffect(() => {
        const from = (pageNumber - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE;
        if (mounted.current) {
            setPage(nfts?.slice(from, to));
        }
    }, [nfts, pageNumber]);

    return (
        nfts.length > 0 ? (
            <div className="section nft--section">
                <div className="section--header row space-between">
                    <div className="row middle">
                        <h2>
                            NFTs in Wallet ({nfts?.length})
                        </h2>
                        <Modal icon="info" data={nftsMessage} />
                    </div>
                </div>
                <div className="row wrap center">
                    {page?.map((nft, idx) => (
                        <Nft
                            key={idx}
                            id={nft.id}
                            network={network}
                            metadata={nft.metadata}
                        />
                    ))}
                </div>
                <Pagination
                    classNames="margin-t-t"
                    currentPage={pageNumber}
                    totalCount={nfts?.length ?? 0}
                    pageSize={PAGE_SIZE}
                    siblingsCount={1}
                    onPageChange={newPage => setPageNumber(newPage)}
                />
            </div>
        ) : null
    );
};

/**
 * Tries to parse hex data into NFT immutable metadata (tip-27).
 * @param metadataHex The encoded data.
 * @returns The parsed INftImmutableMetadata or undefined.
 */
function tryParseNftMetadata(metadataHex: HexEncodedString): INftImmutableMetadata | undefined {
    const validator = new jsonschema.Validator();
    try {
        const json: unknown = JSON.parse(Converter.hexToUtf8(metadataHex));
        const result = validator.validate(json, nftSchemeIRC27);

        if (result.valid) {
            return json as INftImmutableMetadata;
        }
    } catch { }
}

NftSection.defaultProps = {
    bech32Address: undefined,
    setNftCount: undefined
};

export default NftSection;

