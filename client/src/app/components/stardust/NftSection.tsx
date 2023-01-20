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

interface INftDetails {
    /** NFT id. */
    id: string;
    /** Immutable metadata */
    metadata?: INftMetadata;
}

export interface INftMetadata {
    /** The IRC standard of the nft metadata */
    standard?: "IRC27";
    /** The version of the IRC standard */
    version?: string;
    /** The defined schema type */
    type?: "image/jpeg" | "image/png" | "image/gif";
    /** The url pointing to the NFT file location with MIME type defined in type */
    uri?: string;
    /** The human-readable name of the nft */
    name?: string;
    /** The human-readable name of the collection */
    collectionName?: string;
    /** The key value pair where payment address mapped to the payout percentage */
    royalities?: Record<string, unknown>;
    /** The human-readable name of the creator */
    issuerName?: string;
    /** The human-readable description of the nft */
    description?: string;
    /** The additional attributes of the NFT */
    attributes?: [];
    /** The error */
    error?: string;
}

const PAGE_SIZE = 10;

const NftSection: React.FC<NftSectionProps> = ({ network, bech32Address, outputs, setNftCount }) => {
    const mounted = useRef(false);
    const [nfts, setNfts] = useState<INftDetails[]>([]);
    const [page, setPage] = useState<INftDetails[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);

    const unmount = () => {
        mounted.current = false;
    };

    useEffect(() => {
        mounted.current = true;
        const theNfts: INftDetails[] = [];

        if (outputs) {
            for (const output of outputs) {
                if (output && !output.metadata.isSpent && output.output.type === NFT_OUTPUT_TYPE) {
                    const outputId = TransactionHelper.outputIdFromTransactionData(
                        output.metadata.transactionId,
                        output.metadata.outputIndex
                    );
                    const nftOutput = output.output;
                    const nftId = TransactionsHelper.buildIdHashForAliasOrNft(nftOutput.nftId, outputId);
                    const nftMetadata = nftOutput.immutableFeatures?.find(
                        feature => feature.type === METADATA_FEATURE_TYPE
                    ) as IMetadataFeature;
                    let metadata: INftMetadata | undefined;

                    if (nftMetadata) {
                        metadata = hexToJson(nftMetadata.data);
                    }
                    theNfts.push({
                        id: nftId,
                        metadata
                    });
                }
            }
        }
        setNfts(theNfts);

        if (setNftCount) {
            setNftCount(theNfts.length);
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
 * Helper function to convert HexEncodedString to NFT metadata json.
 * @param hex The HexEncodedString.
 * @returns The json.
 */
function hexToJson(hex: HexEncodedString) {
    const validator = new jsonschema.Validator();
    const utf8 = Converter.hexToUtf8(hex);
    try {
        if (utf8) {
            const json: INftMetadata = JSON.parse(utf8);
            const result = validator.validate(json, nftSchemeIRC27);
            return result.valid ?
                json :
                { error: "Invalid hex provided" };
        }
    } catch {
        return { error: "Invalid hex provided" };
    }
}

NftSection.defaultProps = {
    bech32Address: undefined,
    setNftCount: undefined
};

export default NftSection;

