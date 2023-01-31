import { IOutputResponse, NFT_OUTPUT_TYPE, TransactionHelper } from "@iota/iota.js-stardust";
import React, { useEffect, useState } from "react";
import { useIsMounted } from "../../../helpers/hooks/useIsMounted";
import { TransactionsHelper } from "../../../helpers/stardust/transactionsHelper";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import Nft from "../../components/stardust/Nft";
import nftsMessage from "./../../../assets/modals/stardust/address/nfts-in-wallet.json";

interface NftSectionProps {
    network: string;
    bech32Address?: string;
    outputs: IOutputResponse[] | null;
    setNftCount?: React.Dispatch<React.SetStateAction<number>>;
}

interface INftDetails {
    /** NFT image. */
    image?: string;
    /** NFT name. */
    name?: string;
    /** NFT id. */
    id: string;
}

const PAGE_SIZE = 10;

const NftSection: React.FC<NftSectionProps> = ({ network, bech32Address, outputs, setNftCount }) => {
    const isMounted = useIsMounted();
    const [nfts, setNfts] = useState<INftDetails[]>([]);
    const [page, setPage] = useState<INftDetails[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);

    useEffect(() => {
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
                    theNfts.push({
                        id: nftId,
                        image:
                            "https://cdn.pixabay.com/photo/2021/11/06/14/40/nft-6773494_960_720.png"
                    });
                }
            }

            if (isMounted) {
                setNfts(theNfts);

                if (setNftCount) {
                    setNftCount(theNfts.length);
                }
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
                            name={nft.name}
                            network={network}
                            image={nft.image}
                        />
                    ))}
                </div>
                <Pagination
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

