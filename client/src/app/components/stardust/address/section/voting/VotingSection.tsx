import React, { useEffect, useState } from "react";
import { useIsMounted } from "../../../../../../helpers/hooks/useIsMounted";
import { IParticipation } from "../../../../../../models/api/stardust/participation/IParticipation";
import Pagination from "../../../../Pagination";
import VotingEvent from "./VotingEvent";

interface VotingSectionProps {
    participations?: IParticipation[];
}

const PAGE_SIZE = 10;

const VotingSection: React.FC<VotingSectionProps> = ({ participations }) => {
    const isMounted = useIsMounted();
    const [currentPage, setCurrentPage] = useState<IParticipation[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);

    // On page change handler
    useEffect(() => {
        const from = (pageNumber - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE;
        if (isMounted && participations) {
            setCurrentPage(participations.slice(from, to));
        }
    }, [participations, pageNumber]);

    return (
        <div className="section">
            <div className="section--data">
                {currentPage?.map((participation, idx) => (
                    <VotingEvent
                        key={idx}
                        participation={participation}
                    />
                ))}
            </div>
            <Pagination
                currentPage={pageNumber}
                totalCount={participations?.length ?? 0}
                pageSize={PAGE_SIZE}
                siblingsCount={1}
                onPageChange={newPage => setPageNumber(newPage)}
            />
        </div >
    );
};

VotingSection.defaultProps = {
    participations: undefined
};

export default VotingSection;
