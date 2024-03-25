import { OutputWithMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { OUTPUT_LIST_TABS } from "~app/routes/stardust/OutputList";
import { ServiceFactory } from "~factories/serviceFactory";
import { ITaggedOutputsResponse } from "~models/api/stardust/ITaggedOutputsResponse";
import { NOVA } from "~models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";

interface OutputListLocationProps {
    outputIds: ITaggedOutputsResponse;
    tag: string;
}

interface OutputListItem {
    outputDetails: OutputWithMetadataResponse;
    outputId: string;
}

const PAGE_SIZE = 10;
const OUTPUTS_LIMIT = 100;

/**
 * Fetch Tagged outputs with cursor.
 * @param network The Network in context.
 * @returns The taggedOutputs state.
 */
export function useTaggedOutputs(
    network: string,
): [
    string,
    OutputListItem[],
    OutputListItem[],
    number,
    number,
    number,
    number,
    React.Dispatch<React.SetStateAction<number>>,
    React.Dispatch<React.SetStateAction<number>>,
    number,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    (outputType: "basic" | "nft") => Promise<void>,
] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const location = useLocation<OutputListLocationProps>();
    const searchParams = new URLSearchParams(location.search);
    const history = useHistory();
    const { outputIds, tag } = location.state ?? {
        outputIds: [],
        tag: "",
    };

    const [basicOutputItems, setBasicOutputItems] = useState<OutputListItem[] | null>(null);
    const [nftOutputItems, setNftOutputItems] = useState<OutputListItem[] | null>(null);

    const [basicOutputsCursor, setBasicOutputsCursor] = useState<string | undefined>();
    const [nftOutputsCursor, setNftOutputsCursor] = useState<string | undefined>();

    const [isBasicLoading, setIsBasicLoading] = useState(false);
    const [isNftLoading, setIsNftLoading] = useState(false);

    const [pageNumberBasic, setPageNumberBasic] = useState(1);
    const [pageNumberNft, setPageNumberNft] = useState(1);

    const [currentPageBasic, setCurrentPageBasic] = useState<OutputListItem[]>([]);
    const [currentPageNft, setCurrentPageNft] = useState<OutputListItem[]>([]);

    const loadOutputDetails = async (
        outputs: string[],
        setState: React.Dispatch<React.SetStateAction<OutputListItem[] | null>>,
        setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    ) => {
        setLoading(true);
        const itemsUpdate: OutputListItem[] = [];
        const promises: Promise<void>[] = [];

        for (const outputId of outputs) {
            promises.push(
                apiClient.outputDetails({ network, outputId }).then((response) => {
                    const details = response.output;
                    if (!response.error && details?.output && details?.metadata) {
                        const item: OutputListItem = {
                            outputDetails: details,
                            outputId,
                        };
                        itemsUpdate.push(item);
                    }
                }),
            );
        }

        try {
            await Promise.all(promises);

            if (isMounted) {
                setState((prevState) => [...(prevState ?? []), ...itemsUpdate]);
            }
        } finally {
            setLoading(false);
        }
    };

    const loadMore = async (outputType: "basic" | "nft") => {
        apiClient
            .outputsByTag({
                network,
                tag,
                outputType,
                cursor: outputType === "basic" ? basicOutputsCursor : nftOutputsCursor,
            })
            .then((response) => {
                if (!response.error && response.outputs) {
                    if (outputType === "basic") {
                        // eslint-disable-next-line no-void
                        void loadOutputDetails(response.outputs.items, setBasicOutputItems, setIsBasicLoading);
                        if (isMounted) {
                            setBasicOutputsCursor(response.outputs.cursor);
                        }
                    }

                    if (outputType === "nft") {
                        // eslint-disable-next-line no-void
                        void loadOutputDetails(response.outputs.items, setNftOutputItems, setIsNftLoading);
                        if (isMounted) {
                            setNftOutputsCursor(response.outputs.cursor);
                        }
                    }
                }
            })
            .catch((_) => {});
    };

    useEffect(() => {
        setBasicOutputItems(null);
        setNftOutputItems(null);
        // basic output ids
        if (outputIds.basicOutputs?.outputs?.items) {
            // eslint-disable-next-line no-void
            void loadOutputDetails(outputIds.basicOutputs.outputs.items, setBasicOutputItems, setIsBasicLoading);
            setBasicOutputsCursor(outputIds.basicOutputs.outputs.cursor);
        }
        // nft output ids
        if (outputIds.nftOutputs?.outputs?.items) {
            // eslint-disable-next-line no-void
            void loadOutputDetails(outputIds.nftOutputs.outputs.items, setNftOutputItems, setIsNftLoading);
            setNftOutputsCursor(outputIds.nftOutputs.outputs.cursor);
        }
    }, [network]);

    useEffect(() => {
        if (!isBasicLoading && !isNftLoading && !searchParams.get("tab")) {
            const hasBasicOutputs = (basicOutputItems ?? []).length > 0;
            const hasNftOutputs = (nftOutputItems ?? []).length > 0;
            if (!hasBasicOutputs && hasNftOutputs) {
                searchParams.append("tab", Object.keys(OUTPUT_LIST_TABS)[1]);
            } else {
                searchParams.append("tab", Object.keys(OUTPUT_LIST_TABS)[0]);
            }

            history.push({ ...location, search: searchParams.toString() });
        }
    }, [isBasicLoading, isNftLoading, basicOutputItems, nftOutputItems]);

    useEffect(() => {
        const from = (pageNumberBasic - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE;
        if (basicOutputItems) {
            setCurrentPageBasic(basicOutputItems.slice(from, to));
        }
    }, [basicOutputItems, pageNumberBasic]);

    useEffect(() => {
        const from = (pageNumberNft - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE;
        if (nftOutputItems) {
            setCurrentPageNft(nftOutputItems.slice(from, to));
        }
    }, [nftOutputItems, pageNumberNft]);

    const totalBasicItems = (basicOutputItems ?? []).length;
    const totalNftItems = (nftOutputItems ?? []).length;
    const basicOutputLimitReached = totalBasicItems >= OUTPUTS_LIMIT;
    const nftOutputLimitReached = totalNftItems >= OUTPUTS_LIMIT;
    const hasMoreBasicOutputs = Boolean(basicOutputsCursor);
    const hasMoreNftOutputs = Boolean(nftOutputsCursor);

    return [
        tag,
        currentPageBasic,
        currentPageNft,
        totalBasicItems,
        totalNftItems,
        pageNumberBasic,
        pageNumberNft,
        setPageNumberBasic,
        setPageNumberNft,
        PAGE_SIZE,
        isBasicLoading,
        isNftLoading,
        basicOutputLimitReached,
        nftOutputLimitReached,
        hasMoreBasicOutputs,
        hasMoreNftOutputs,
        loadMore,
    ];
}
