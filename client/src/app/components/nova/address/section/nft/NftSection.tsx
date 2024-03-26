import { NftOutput, OutputWithMetadataResponse } from "@iota/sdk-wasm-nova/web";
import React, { useEffect, useState } from "react";
import Nft from "./Nft";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import Pagination from "~/app/components/Pagination";

interface NftSectionProps {
    readonly outputs: OutputWithMetadataResponse[] | null;
    readonly setNftCount?: (count: number) => void;
}

const PAGE_SIZE = 10;

const NftSection: React.FC<NftSectionProps> = ({ outputs }) => {
    const isMounted = useIsMounted();
    const [page, setPage] = useState<OutputWithMetadataResponse[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);

    // On page change handler
    useEffect(() => {
        if (outputs) {
            const from = (pageNumber - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE;
            if (isMounted) {
                setPage(outputs.slice(from, to));
            }
        }
    }, [outputs, pageNumber]);

    return outputs && outputs.length > 0 ? (
        <div className="section nft--section">
            <div className="row wrap">
                {page?.map((output, idx) => <Nft key={idx} nftOutput={output.output as NftOutput} outputId={output.metadata.outputId} />)}
            </div>
            <Pagination
                classNames="margin-t-t"
                currentPage={pageNumber}
                totalCount={outputs.length}
                pageSize={PAGE_SIZE}
                siblingsCount={1}
                onPageChange={(newPage) => setPageNumber(newPage)}
            />
        </div>
    ) : null;
};

NftSection.defaultProps = {
    setNftCount: undefined,
};

export default NftSection;
