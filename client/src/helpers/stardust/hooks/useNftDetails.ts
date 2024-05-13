import {
    AddressType,
    AliasAddress,
    Ed25519Address,
    FeatureType,
    HexEncodedString,
    IssuerFeature,
    MetadataFeature,
    NftAddress,
    NftOutput,
} from "@iota/sdk-wasm-stardust/web";
import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { HexHelper } from "~helpers/stardust/hexHelper";

/**
 * Fetch nft output details
 * @param network The Network in context
 * @param nftId The nft id
 * @returns The output responses and loading bool.
 */
export function useNftDetails(network: string, nftId: string | null): [NftOutput | null, HexEncodedString | null, string | null, boolean] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [nftOutput, setNftOutput] = useState<NftOutput | null>(null);
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
                apiClient
                    .nftDetails({
                        network,
                        nftId: HexHelper.addPrefix(nftId),
                    })
                    .then((response) => {
                        if (!response?.error) {
                            const output = response.nftDetails?.output as NftOutput;

                            const metadataFeature = output?.immutableFeatures?.find(
                                (feature) => feature.type === FeatureType.Metadata,
                            ) as MetadataFeature;

                            const issuerFeature = output?.immutableFeatures?.find(
                                (feature) => feature.type === FeatureType.Issuer,
                            ) as IssuerFeature;

                            let issuerId = null;
                            if (issuerFeature) {
                                switch (issuerFeature.address.type) {
                                    case AddressType.Ed25519: {
                                        const ed25519Address = issuerFeature.address as Ed25519Address;
                                        issuerId = ed25519Address.pubKeyHash;
                                        break;
                                    }
                                    case AddressType.Alias: {
                                        const aliasAddress = issuerFeature.address as AliasAddress;
                                        issuerId = aliasAddress.aliasId;
                                        break;
                                    }
                                    case AddressType.Nft: {
                                        const nftAddress = issuerFeature.address as NftAddress;
                                        issuerId = nftAddress.nftId;
                                        break;
                                    }
                                    default: {
                                        break;
                                    }
                                }
                            }

                            if (isMounted) {
                                setNftMetadata(metadataFeature?.data ?? null);
                                setNftOutput(output);
                                setNftIssuerId(issuerId);
                            }
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, nftId]);

    return [nftOutput, nftMetadata, nftIssuerId, isLoading];
}
