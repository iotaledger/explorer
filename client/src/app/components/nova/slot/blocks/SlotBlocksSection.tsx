import React, { useEffect, useState } from "react";
import SlotBlocksSectionRow from "./SlotBlocksSectionRow";
import Spinner from "~/app/components/Spinner";
import Pagination from "~/app/components/Pagination";
import { ISlotBlock } from "~/models/api/nova/ISlotBlocksResponse";
import useSlotBlocks from "~/helpers/nova/hooks/useSlotBlocks";
import "./SlotBlocksSection.scss";

interface SlotBlocksSectionProps {
    readonly slotIndex: string | null;
}

const PAGE_SIZE: number = 10;

const SlotBlocksSection: React.FC<SlotBlocksSectionProps> = ({ slotIndex }) => {
    const { blocks, isLoading } = useSlotBlocks(slotIndex);
    const [currentPage, setCurrentPage] = useState<ISlotBlock[]>([]);
    const [pageNumber, setPageNumber] = useState(1);

    useEffect(() => {
        const from = (pageNumber - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE;
        if (blocks) {
            setCurrentPage(blocks.slice(from, to));
        }
    }, [blocks, pageNumber]);

    const showPagination: boolean = (blocks?.length ?? 0) > PAGE_SIZE;

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
                            {currentPage.map((block, idx) => (
                                <SlotBlocksSectionRow key={`block-${pageNumber}-${idx}`} slotBlock={block} isTable={true} />
                            ))}
                        </tbody>
                    </table>
                    <div className="refblocks__cards">
                        {currentPage.map((block, idx) => (
                            <SlotBlocksSectionRow key={`block-${pageNumber}-${idx}`} slotBlock={block} />
                        ))}
                    </div>
                </React.Fragment>
            ) : (
                isLoading && <Spinner />
            )}
            {showPagination && (
                <Pagination
                    currentPage={pageNumber}
                    totalCount={blocks?.length ?? 0}
                    pageSize={PAGE_SIZE}
                    siblingsCount={1}
                    onPageChange={(page) => setPageNumber(page)}
                />
            )}
        </div>
    );
};

SlotBlocksSection.defaultProps = {
    slotIndex: null,
};

export default SlotBlocksSection;
