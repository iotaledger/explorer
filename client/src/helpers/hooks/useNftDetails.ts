import {
    AddressType,
    AliasAddress,
    Ed25519Address,
    FeatureType,
    HexEncodedString, IssuerFeature, MetadataFeature, NftAddress, NftOutput
} from "@iota/iota.js-stardust/web";
import { HexHelper } from "@iota/util.js-stardust";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustApiClient } from "../../services/stardust/stardustApiClient";
import { useIsMounted } from "./useIsMounted";


/**
 * Fetch nft output details
 * @param network The Network in context
 * @param nftId The nft id
 * @returns The output responses and loading bool.
 */
export function useNftDetails(network: string, nftId: string | null):
    [
        NftOutput | null,
        HexEncodedString | null,
        string | null,
        boolean
    ] {
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
                apiClient.nftDetails({
                    network,
                    nftId: HexHelper.addPrefix(nftId)
                }).then(response => {
                    if (!response?.error) {
                        const output = response.nftDetails?.output as NftOutput;

                        const metadataFeature = output?.getImmutableFeatures()?.find(
                            feature => feature.type === FeatureType.Metadata
                        ) as MetadataFeature;

                        const issuerFeature = output?.getImmutableFeatures()?.find(
                            feature => feature.type === FeatureType.Issuer
                        ) as IssuerFeature;

                        let issuerId = null;
                        if (issuerFeature) {
                            switch (issuerFeature.getIssuer().type) {
                                case AddressType.Ed25519: {
                                    const ed25519Address = issuerFeature.getIssuer() as Ed25519Address;
                                    issuerId = ed25519Address.getPubKeyHash();
                                    break;
                                }
                                case AddressType.Alias: {
                                    const aliasAddress = issuerFeature.getIssuer() as AliasAddress;
                                    issuerId = aliasAddress.getAliasId();
                                    break;
                                }
                                case AddressType.Nft: {
                                    const nftAddress = issuerFeature.getIssuer() as NftAddress;
                                    issuerId = nftAddress.getNftId();
                                    break;
                                }
                                default:
                                    break;
                            }
                        }

                        if (isMounted) {
                            setNftMetadata(metadataFeature?.getData() ?? null);
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

