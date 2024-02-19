import React, { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import Pagination from "~/app/components/Pagination";
import "./AccountFoundriesSection.scss";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";

interface AccountFoundriesSectionProps {
    readonly foundries: string[] | null;
}

const PAGE_SIZE = 10;

const AccountFoundriesSection: React.FC<AccountFoundriesSectionProps> = ({ foundries }) => {
    const { name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const isMounted = useIsMounted();
    const [page, setPage] = useState<string[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);

    // On page change handler
    useEffect(() => {
        const from = (pageNumber - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE;
        if (isMounted && foundries) {
            setPage(foundries.slice(from, to));
        }
    }, [foundries, pageNumber]);

    return (
        <div className="section transaction--section">
            <div className="card controlled-foundry--card">
                <div className="field">
                    <div className="card--label margin-b-t">Foundry Id</div>
                    {page?.map((foundryId, k) => (
                        <div key={k} className="card--value">
                            <TruncatedId id={foundryId} link={`/${network}/foundry/${foundryId}`} />
                        </div>
                    ))}
                </div>
            </div>

            <Pagination
                currentPage={pageNumber}
                totalCount={foundries?.length ?? 0}
                pageSize={PAGE_SIZE}
                siblingsCount={1}
                onPageChange={(newPage) => setPageNumber(newPage)}
            />
        </div>
    );
};

export default AccountFoundriesSection;
