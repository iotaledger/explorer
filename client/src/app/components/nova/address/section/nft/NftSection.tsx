import {
    AddressType,
    AccountAddress,
    Ed25519Address,
    FeatureType,
    IssuerFeature,
    MetadataFeature,
    NftAddress,
    NftOutput,
    OutputResponse,
    OutputType,
    Utils,
} from "@iota/sdk-wasm-nova/web";
import React, { useEffect, useState } from "react";
import Nft from "./Nft";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { INftBase } from "~models/api/nova/nft/INftBase";
import Pagination from "~/app/components/Pagination";

interface NftSectionProps {
    readonly network: string;
    readonly bech32Address?: string;
    readonly outputs: OutputResponse[] | null;
    readonly setNftCount?: (count: number) => void;
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
                if (outputResponse && !outputResponse.metadata.spent && outputResponse.output.type === OutputType.Nft) {
                    const nftOutput = outputResponse.output as NftOutput;
                    const nftId = Utils.computeNftId(outputResponse.metadata.outputId);

                    const metadataFeature = nftOutput.immutableFeatures?.find(
                        (feature) => feature.type === FeatureType.Metadata,
                    ) as MetadataFeature;

                    const issuerFeature = nftOutput.immutableFeatures?.find(
                        (feature) => feature.type === FeatureType.Issuer,
                    ) as IssuerFeature;

                    let issuerId = null;
                    if (issuerFeature) {
                        switch (issuerFeature.address.type) {
                            case AddressType.Ed25519: {
                                issuerId = (issuerFeature.address as Ed25519Address).pubKeyHash;
                                break;
                            }
                            case AddressType.Account: {
                                issuerId = (issuerFeature.address as AccountAddress).accountId;
                                break;
                            }
                            case AddressType.Nft: {
                                issuerId = (issuerFeature.address as NftAddress).nftId;
                                break;
                            }
                            default: {
                                break;
                            }
                        }
                    }

                    theNfts.push({
                        nftId,
                        issuerId,
                        metadata: metadataFeature ?? undefined,
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

    return nfts.length > 0 ? (
        <div className="section nft--section">
            <div className="row wrap">{page?.map((nft, idx) => <Nft key={idx} nft={nft} />)}</div>
            <Pagination
                classNames="margin-t-t"
                currentPage={pageNumber}
                totalCount={nfts?.length ?? 0}
                pageSize={PAGE_SIZE}
                siblingsCount={1}
                onPageChange={(newPage) => setPageNumber(newPage)}
            />
        </div>
    ) : null;
};

NftSection.defaultProps = {
    bech32Address: undefined,
    setNftCount: undefined,
};

export default NftSection;
