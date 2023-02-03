import { Bech32Helper } from "@iota/iota.js";
import { NFT_ADDRESS_TYPE, NFT_OUTPUT_TYPE } from "@iota/iota.js-stardust";
import { Converter } from "@iota/util.js-stardust";
import { useContext, useEffect, useState } from "react";
import NetworkContext from "../../../app/context/NetworkContext";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import { INftBase } from "../nftHelper";
import { parseNFTOutput } from "./useNFTs";

export interface INFTCollectionMember extends INftBase {
    children: INFTCollectionMember[];
}

// Defines the restriction within the collection's child NFTs.
export enum CollRestriction {
    ALL_ISSUERS,
    ONLY_SAME_ISSUER
}

/**
 * Builds up the NFT collection by recursively resolving
 * all child NFTs which are issued by the given collection NFT.
 * @param network
 * @param collNFT
 * @param collRes
 */
export function useNFTCollection(
    network: string, collNFT: INftBase, collRes: CollRestriction
): INFTCollectionMember | null {
    const tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);
    const { bech32Hrp } = useContext(NetworkContext);
    const [collection, setCollection] = useState<INFTCollectionMember | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const bytesNFTId = Converter.hexToBytes(collNFT.id);
                const collNFTAddr = Bech32Helper.toBech32(NFT_ADDRESS_TYPE, bytesNFTId, bech32Hrp);
                const childNFTs = await fetchNFTChildren(collNFT, collNFTAddr,
                    tangleCacheService, network, bech32Hrp, collRes);
                setCollection({ children: childNFTs, metadata: collNFT.metadata, id: collNFT.id });
            } catch {
                // bla
            } finally {
                setIsLoading(false);
            }
        })();
    }, [collNFT.id]);

    return collection;
}

/**
 *
 * @param collNFT
 * @param targetAddr
 * @param tangleCacheService
 * @param network
 * @param hrp
 * @param collRes
 */
async function fetchNFTChildren(
    collNFT: INftBase, targetAddr: string, tangleCacheService: StardustTangleCacheService,
    network: string, hrp: string, collRes: CollRestriction
) {
    const fetchedOutputs = await tangleCacheService.addressOutputs(network, targetAddr);
    if (!fetchedOutputs || fetchedOutputs.error) {
        throw new Error(fetchedOutputs ? fetchedOutputs.error : "could not fetch outputs");
    }

    if (!fetchedOutputs.outputIds) {
        throw new Error("no children");
    }

    const fetches = fetchedOutputs.outputIds
        .map(async outputId => tangleCacheService.outputDetails(network, outputId));

    const outputs = await Promise.all(fetches);
    const ownedOutputs = outputs.map(res => {
        if (!res.error && res.output && res.metadata) {
            return { output: res.output, metadata: res.metadata };
        }
        return null;
    }).filter(ele => ele !== null);

    // eslint-disable-next-line unicorn/no-array-reduce
    const childNFTs = ownedOutputs.reduce<INFTCollectionMember[]>((array, ownedOutput) => {
        if (ownedOutput?.output.type !== NFT_OUTPUT_TYPE) {
            return array;
        }

        // check whether collection NFT is the issuer
        const { nftId, issuerFeature, parsedMetadata } = parseNFTOutput(ownedOutput);
        if (
            issuerFeature.address.type !== NFT_ADDRESS_TYPE ||
            (collRes === CollRestriction.ONLY_SAME_ISSUER &&
                issuerFeature.address.nftId !== collNFT.id)
        ) {
            return array;
        }

        array.push({ id: nftId, metadata: parsedMetadata, children: [] });
        return array;
    }, []);

    // eslint-disable-next-line no-warning-comments
    // TODO: use Promise.all()
    for (const childNFT of childNFTs) {
        const bytesNFTId = Converter.hexToBytes(childNFT.id);
        const subAddr = Bech32Helper.toBech32(NFT_ADDRESS_TYPE, bytesNFTId, hrp);
        const subNFTs = await fetchNFTChildren(collNFT, subAddr, tangleCacheService, network, hrp, collRes);
        childNFT.children = subNFTs;
    }

    return childNFTs;
}
