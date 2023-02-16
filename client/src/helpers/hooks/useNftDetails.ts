import { HexEncodedString, IMetadataFeature, INftOutput, METADATA_FEATURE_TYPE } from "@iota/iota.js-stardust";
import { HexHelper } from "@iota/util.js-stardust";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";


/**
 * Fetch nft output details
 * @param network The Network in context
 * @param nftId The nft id
 * @returns The output responses and loading bool.
 */
export function useNftDetails(network: string, nftId: string | null):
    [
        INftOutput | undefined,
        HexEncodedString |undefined,
        boolean
    ] {
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [nftOutput, setNftOutput] = useState<INftOutput | undefined>();
    const [nftMetadata, setNftMetadata] = useState<HexEncodedString | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (nftId) {
            // eslint-disable-next-line no-void
            void (async () => {
                tangleCacheService.nftDetails({
                    network,
                    nftId: HexHelper.addPrefix(nftId)
                }).then(response => {
                    if (!response?.error) {
                        const output = response.nftDetails?.output as INftOutput;

                        const metadataFeature = output.immutableFeatures?.find(
                            feature => feature.type === METADATA_FEATURE_TYPE
                        ) as IMetadataFeature;

                        setNftOutput(output);
                        setNftMetadata(metadataFeature.data);
                    }
                }).finally(() => {
                    setIsLoading(false);
                });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, nftId]);

    return [nftOutput, nftMetadata, isLoading];
}

