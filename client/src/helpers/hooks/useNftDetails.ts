import {
    ED25519_ADDRESS_TYPE, ALIAS_ADDRESS_TYPE, HexEncodedString, IIssuerFeature,
    IMetadataFeature, INftOutput, ISSUER_FEATURE_TYPE, METADATA_FEATURE_TYPE, NFT_ADDRESS_TYPE
} from "@iota/iota.js-stardust";
import { HexHelper } from "@iota/util.js-stardust";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";
import { useIsMounted } from "./useIsMounted";


/**
 * Fetch nft output details
 * @param network The Network in context
 * @param nftId The nft id
 * @returns The output responses and loading bool.
 */
export function useNftDetails(network: string, nftId: string | null):
    [
        INftOutput | null,
        HexEncodedString | null,
        string | null,
        boolean
    ] {
    const isMounted = useIsMounted();
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [nftOutput, setNftOutput] = useState<INftOutput | null>(null);
    const [nftMetadata, setNftMetadata] = useState<HexEncodedString | null>(null);
    const [nftIssuerId, setNftIssuerId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        setNftMetadata(null);
        setNftOutput(null);
        setNftIssuerId(null);
        if (nftId) {
            // eslint-disable-next-line no-void
            void (async () => {
                tangleCacheService.nftDetails({
                    network,
                    nftId: HexHelper.addPrefix(nftId)
                }).then(response => {
                    if (!response?.error) {
                        const output = response.nftDetails?.output as INftOutput;

                        const metadataFeature = output?.immutableFeatures?.find(
                            feature => feature.type === METADATA_FEATURE_TYPE
                        ) as IMetadataFeature;

                        const issuerFeature = output?.immutableFeatures?.find(
                            feature => feature.type === ISSUER_FEATURE_TYPE
                        ) as IIssuerFeature;

                        let issuerId = null;
                        if (issuerFeature) {
                            switch (issuerFeature.address.type) {
                                case ED25519_ADDRESS_TYPE:
                                    issuerId = issuerFeature.address.pubKeyHash;
                                    break;
                                case ALIAS_ADDRESS_TYPE:
                                    issuerId = issuerFeature.address.aliasId;
                                    break;
                                case NFT_ADDRESS_TYPE:
                                    issuerId = issuerFeature.address.nftId;
                                    break;
                                default:
                                    break;
                            }
                        }

                        if (isMounted) {
                            setNftMetadata(metadataFeature?.data ?? null);
                            setNftOutput(output);
                            setNftIssuerId(issuerId);
                        }
                    }
                }).finally(() => {
                    setIsLoading(false);
                });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, nftId]);

    return [nftOutput, nftMetadata, nftIssuerId, isLoading];
}

