import classNames from "classnames";
import React, { useEffect, useState } from "react";
import VotingEvent from "./VotingEvent";
import { VotingEventTab, buildVotingEventTabs } from "./VotingUtils";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { IEventDetails } from "~helpers/stardust/hooks/useParticipationEventDetails";
import Pagination from "../../../../Pagination";
import "./VotingSection.scss";

interface VotingSectionProps {
    readonly eventDetails: IEventDetails[];
}

const PAGE_SIZE = 10;

const VotingSection: React.FC<VotingSectionProps> = ({ eventDetails }) => {
    const isMounted = useIsMounted();
    const [currentPage, setCurrentPage] = useState<IEventDetails[]>([]);
    const [filteredEventDetails, setFilteredEventDetails] = useState<IEventDetails[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [currentTab, setCurrentTab] = useState<VotingEventTab>();
    const [tabsToRender, setTabsToRender] = useState<VotingEventTab[]>([]);

    useEffect(() => {
        const tabs = buildVotingEventTabs(eventDetails);
        setTabsToRender(tabs);
        if (tabs.length > 0) {
            setCurrentTab(tabs[0]);
        }
    }, [eventDetails]);

    useEffect(() => {
        const filteredResults = eventDetails.filter((event) => event.status?.status.startsWith(currentTab ?? ""));
        setFilteredEventDetails(filteredResults);
        setPageNumber(1);
    }, [currentTab]);

    useEffect(() => {
        const from = (pageNumber - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE;
        if (isMounted && filteredEventDetails) {
            setCurrentPage(filteredEventDetails.slice(from, to));
        }
    }, [pageNumber, filteredEventDetails]);

    return (
        <div className="section voting-section">
            <div className="section--header">
                <div className="tabs-wrapper">
                    {tabsToRender.map((tab, idx) => (
                        <button
                            type="button"
                            key={idx}
                            className={classNames("tab", { active: tab === currentTab })}
                            onClick={() => setCurrentTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            <div className="section--data">{currentPage?.map((event, idx) => <VotingEvent key={idx} event={event} />)}</div>
            <Pagination
                currentPage={pageNumber}
                totalCount={filteredEventDetails.length}
                pageSize={PAGE_SIZE}
                siblingsCount={1}
                onPageChange={(newPage) => setPageNumber(newPage)}
            />
        </div>
    );
};

export default VotingSection;
