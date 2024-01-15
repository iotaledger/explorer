import React, { useEffect, useState } from "react";
import ReferencedBlocksSectionRow from "./ReferencedBlocksSectionRow";
import Pagination from "../../../../Pagination";
import Spinner from "../../../../Spinner";
import "./ReferencedBlocksSection.scss";

interface ReferencedBlocksSectionProps {
    readonly blockIds?: string[];
}

const PAGE_SIZE: number = 10;

const ReferencedBlocksSection: React.FC<ReferencedBlocksSectionProps> = ({ blockIds }) => {
    const [currentPage, setCurrentPage] = useState<string[]>([]);
    const [pageNumber, setPageNumber] = useState(1);

    useEffect(() => {
        const from = (pageNumber - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE;
        if (blockIds) {
            setCurrentPage(blockIds.slice(from, to));
        }
    }, [blockIds, pageNumber]);

    const showPagination: boolean = (blockIds?.length ?? 0) > PAGE_SIZE;

    return (
        <div className="section refblocks">
            {currentPage.length > 0 ? (
                <React.Fragment>
                    <table className="refblocks__table">
                        <thead className="refblocks__table-head">
                            <tr>
                                <th className="refblocks__block-id">BLOCK ID</th>
                                <th className="refblocks__payload">PAYLOAD TYPE</th>
                                <th className="refblocks__tx-value">VALUE</th>
                            </tr>
                        </thead>
                        <tbody className="refblocks__table-body">
                            {currentPage.map((blockId, idx) => (
                                <ReferencedBlocksSectionRow key={`block-${pageNumber}-${idx}`} blockId={blockId} isTable={true} />
                            ))}
                        </tbody>
                    </table>
                    <div className="refblocks__cards">
                        {currentPage.map((blockId, idx) => (
                            <ReferencedBlocksSectionRow key={`block-${pageNumber}-${idx}`} blockId={blockId} />
                        ))}
                    </div>
                </React.Fragment>
            ) : (
                <Spinner />
            )}
            {showPagination && (
                <Pagination
                    currentPage={pageNumber}
                    totalCount={blockIds?.length ?? 0}
                    pageSize={PAGE_SIZE}
                    siblingsCount={1}
                    onPageChange={(page) => setPageNumber(page)}
                />
            )}
        </div>
    );
};

ReferencedBlocksSection.defaultProps = {
    blockIds: undefined,
};

export default ReferencedBlocksSection;
