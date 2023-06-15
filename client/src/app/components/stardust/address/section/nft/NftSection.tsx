import {
    AddressType,
    FeatureType,
    IssuerFeature, MetadataFeature, NftOutput, OutputResponse, OutputType, TransactionHelper
} from "@iota/iota.js-stardust";

import React, { useEffect, useState } from "react";
import { useIsMounted } from "../../../../../../helpers/hooks/useIsMounted";
import { TransactionsHelper } from "../../../../../../helpers/stardust/transactionsHelper";
import { INftBase } from "../../../../../../models/api/stardust/nft/INftBase";
import Pagination from "../../../../Pagination";
import Nft from "./Nft";

interface NftSectionProps {
    network: string;
    bech32Address?: string;
    outputs: OutputResponse[] | null;
    setNftCount?: (count: number) => void;
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
                    outputResponse.output.getType() === OutputType.Nft
                ) {
                    const outputId = TransactionHelper.outputIdFromTransactionData(
                        outputResponse.metadata.transactionId,
                        outputResponse.metadata.outputIndex
                    );

                    const nftOutput = outputResponse.output as NftOutput;
                    const nftId = TransactionsHelper.buildIdHashForAliasOrNft(nftOutput.getNnftId(), outputId);
                    const metadataFeature = nftOutput.getImmutableFeatures()?.find(
                        feature => feature.getType() === FeatureType.Metadata
                    ) as MetadataFeature;

                    const issuerFeature = nftOutput.getImmutableFeatures()?.find(
                        feature => feature.getType() === FeatureType.Issuer
                    ) as IssuerFeature;

                    let issuerId = null;
                    if (issuerFeature) {
                        switch (issuerFeature.getIssuer().getType()) {
                            case AddressType.Ed25519:
                                issuerId = issuerFeature.address.pubKeyHash;
                                break;
                            case AddressType.Alias:
                                issuerId = issuerFeature.address.aliasId;
                                break;
                            case AddressType.Nft:
                                issuerId = issuerFeature.address.nftId;
                                break;
                            default:
                                break;
                        }
                    }

                    theNfts.push({
                        nftId,
                        issuerId,
                        metadata: metadataFeature?.getData() ?? undefined
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
                            nft={nft}
                            network={network}
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

