/* eslint-disable @typescript-eslint/no-floating-promises */
import { Blake2b } from "@iota/crypto.js-stardust";
import { NFT_OUTPUT_TYPE } from "@iota/iota.js-stardust";
import { Converter, HexHelper } from "@iota/util.js-stardust";
import bigInt from "big-integer";
import React, { useEffect, useRef, useState } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import Pagination from "../../components/Pagination";
import Nft from "../../components/stardust/Nft";
import INftDetails from "./INftDetails";

interface NftSectionProps {
    network: string;
    bech32Address?: string;
}

const PAGE_SIZE = 10;

const NftSection: React.FC<NftSectionProps> = ({ network, bech32Address }) => {
    const mounted = useRef(false);
    const [nfts, setNfts] = useState<INftDetails[]>([]);
    const [page, setPage] = useState<INftDetails[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);

    const unmount = () => {
        mounted.current = false;
    };

    useEffect(() => {
        mounted.current = true;
        const tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);
        const theNfts: INftDetails[] = [];

        const fetchNfts = async () => {
            if (!bech32Address) {
                return;
            }

            const nftOutputs = await tangleCacheService.nfts({
                network,
                address: bech32Address
            });

            if (nftOutputs?.outputs && nftOutputs?.outputs?.items.length > 0) {
                for (const outputId of nftOutputs.outputs.items) {
                    const output = await tangleCacheService.outputDetails(network, outputId);
                    if (output && !output.metadata.isSpent && output.output.type === NFT_OUTPUT_TYPE) {
                        const nftOutput = output.output;
                        const nftId = !HexHelper.toBigInt256(nftOutput.nftId).eq(bigInt.zero)
                            ? nftOutput.nftId
                            // NFT has Id 0 because it hasn't move, but we can compute it as a hash of the outputId
                                : HexHelper.addPrefix(Converter.bytesToHex(
                                    Blake2b.sum256(Converter.hexToBytes(HexHelper.stripPrefix(outputId)))
                                ));

                                theNfts.push({
                                    id: nftId,
                                    image: "https://cdn.pixabay.com/photo/2021/11/06/14/40/nft-6773494_960_720.png"
                                });
                    }
                }
            }

            if (mounted.current) {
                setNfts(theNfts);
            }
        };

        fetchNfts();

        return unmount;
    }, [network, bech32Address]);

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
            <div className="section transaction--section">
                <div className="section--header row space-between">
                    <div className="row middle">
                        <h2>
                            NFTs in Wallet ({nfts?.length})
                        </h2>
                    </div>
                </div>
                <div className="row wrap">
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
    bech32Address: undefined
};

export default NftSection;

