import { IOutputResponse } from "@iota/iota.js-stardust";
import React, { useEffect, useRef, useState } from "react";
import { NFTFilter, useNFTs } from "../../../helpers/stardust/hooks/useNFTs";
import { INftBase } from "../../../helpers/stardust/nftHelper";
import { usePagination } from "../../../helpers/usePagination";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import Nft from "../../components/stardust/Nft";
import nftsMessage from "./../../../assets/modals/stardust/address/nfts-in-wallet.json";
import CollectionNFT from "./CollectionNFT";

interface CampaignsProps {
    network: string;
    bech32Address?: string;
    outputs: IOutputResponse[] | undefined;
    setCount?: React.Dispatch<React.SetStateAction<number>>;
}

const PAGE_SIZE = 10;

const CollectionNFTs: React.FC<CampaignsProps> = ({ network, bech32Address, outputs, setCount }) => {
    const mounted = useRef(false);
    const nfts = useNFTs(mounted, outputs ?? [], network, bech32Address ?? "", NFTFilter.COLLECTION);
    const [pageNFTs, setPageNFTs] = useState<INftBase[]>([]);
    const [pageNumber, setPageNumber] = usePagination(mounted, nfts, PAGE_SIZE, setPageNFTs);

    useEffect(() => {
        if (mounted.current && setCount) {
            setCount(nfts.length);
        }
    }, [nfts]);

    if (nfts.length === 0) {
        return null;
    }

    return (
        <div className="section nft--section">
            <div className="section--header row space-between">
                <div className="row middle">
                    <h2>
                        Collection NFTs In Wallet ({nfts?.length})
                    </h2>
                    <Modal icon="info" data={nftsMessage} />
                </div>
            </div>
            <div className="row wrap center">
                {pageNFTs?.map((nft, idx) => (
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
            {nfts.length > 0 && <CollectionNFT network={network} collectionNFT={nfts[0]} />}
        </div>
    );
};

CollectionNFTs.defaultProps = {
    bech32Address: undefined,
    setCount: undefined
};

export default CollectionNFTs;

