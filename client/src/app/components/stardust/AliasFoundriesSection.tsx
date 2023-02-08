import React, { useEffect, useState } from "react";
import { useIsMounted } from "../../../helpers/hooks/useIsMounted";
import Modal from "../Modal";
import Pagination from "../Pagination";
import foundriesMessage from "./../../../assets/modals/stardust/alias/foundries.json";
import ControlledFoundry from "./ControlledFoundry";

interface AliasFoundriesSectionProps {
    network: string;
    foundries?: string[];
}

const PAGE_SIZE = 10;

const AliasFoundriesSection: React.FC<AliasFoundriesSectionProps> = ({ network, foundries = [] }) => {
    const isMounted = useIsMounted();
    const [page, setPage] = useState<string[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);

    // On page change handler
    useEffect(() => {
        const from = (pageNumber - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE;
        if (isMounted) {
            setPage(foundries.slice(from, to));
        }
    }, [foundries, pageNumber]);

    return (
        <div className="section transaction--section">
            <div className="section--header row space-between">
                <div className="row middle">
                    <h2>
                        Controlled foundries ({foundries?.length})
                    </h2>
                    <Modal icon="info" data={foundriesMessage} />
                </div>
            </div>
            <table className="controlled-foundry--table">
                <thead>
                    <tr>
                        <th>Foundry Id</th>
                    </tr>
                </thead>
                <tbody>
                    {page?.map((foundryId, k) => (
                        <React.Fragment key={`${foundryId}${k}`}>
                            <ControlledFoundry
                                key={k}
                                foundryId={foundryId}
                                network={network}
                                tableFormat={true}
                            />
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            {/* Only visible in mobile -- Card assets*/}
            <div className="controlled-foundry--cards">
                {page?.map((foundryId, k) => (
                    <React.Fragment key={`${foundryId}${k}`}>
                        <ControlledFoundry
                            key={k}
                            foundryId={foundryId}
                            network={network}
                        />
                    </React.Fragment>
                ))}
            </div>
            <Pagination
                currentPage={pageNumber}
                totalCount={foundries?.length ?? 0}
                pageSize={PAGE_SIZE}
                siblingsCount={1}
                onPageChange={newPage => setPageNumber(newPage)}
            />
        </div>
    );
};

AliasFoundriesSection.defaultProps = {
    foundries: []
};

export default AliasFoundriesSection;
