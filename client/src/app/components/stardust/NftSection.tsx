import {
    IMetadataFeature,
    IOutputResponse,
    METADATA_FEATURE_TYPE,
    NFT_OUTPUT_TYPE,
    TransactionHelper
} from "@iota/iota.js-stardust";
import React, { useEffect, useState } from "react";
import { useIsMounted } from "../../../helpers/hooks/useIsMounted";
import { INftBase, tryParseNftMetadata } from "../../../helpers/stardust/nftHelper";
import { TransactionsHelper } from "../../../helpers/stardust/transactionsHelper";
import Pagination from "../../components/Pagination";
import Nft from "../../components/stardust/Nft";

interface NftSectionProps {
    network: string;
    bech32Address?: string;
    outputs: IOutputResponse[] | null;
    setNftCount?: React.Dispatch<React.SetStateAction<number>>;
}

const PAGE_SIZE = 10;

const NftSection: React.FC<NftSectionProps> = ({ network, bech32Address, outputs, setNftCount }) => {
    const isMounted = useIsMounted();
    const [nfts, setNfts] = useState<INftBase[]>([]);
    const [page, setPage] = useState<INftBase[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);

    useEffect(() => {
        const theNfts: INftBase[] = [];
        if (setNftCount) {
            setNftCount(0);
        }

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

        if (isMounted) {
            setNfts(theNfts);

            if (setNftCount) {
                setNftCount(theNfts.length);
            }
        }
    }, [outputs, network, bech32Address]);

    // On page change handler
    useEffect(() => {
        const from = (pageNumber - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE;
        if (isMounted) {
            setPage(nfts?.slice(from, to));
        }
    }, [nfts, pageNumber]);

    return (
        nfts.length > 0 ? (
            <div className="section nft--section">
                <div className="row wrap">
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

NftSection.defaultProps = {
    bech32Address: undefined,
    setNftCount: undefined
};

export default NftSection;

