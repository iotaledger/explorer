import classNames from "classnames";
import React, { useState } from "react";
import Spinner from "../Spinner";
import "./TabbedSection.scss";

interface TabOption {
    disabled?: boolean;
    counter?: number;
    isLoading?: boolean;
}

interface TabOptions {
    [tabName: string]: TabOption;
}

interface TabbedSectionProps {
    tabsEnum: Record<string, string>;
    children: React.ReactElement[];
    tabOptions?: TabOptions;
}

const TabbedSection: React.FC<TabbedSectionProps> = ({ tabsEnum, children, tabOptions }) => {
    const [selectedTab, setSelectedTab] = useState<number>(0);
    const TABS: string[] = [...Object.values(tabsEnum)];

    const tabsView = (
        <div className="tabbed-section--tabs-wrapper">
            {TABS.map((tab, idx) => {
                const isDisabled = tabOptions ?
                    (tabOptions[tab]?.disabled !== undefined ? tabOptions[tab].disabled : false)
                    : false;

                const counter = tabOptions ?
                    (tabOptions[tab]?.counter !== undefined ? tabOptions[tab].counter : 0)
                    : 0;

                const isLoading = tabOptions ?
                    (tabOptions[tab]?.isLoading !== undefined ? tabOptions[tab].isLoading : false)
                    : false;

                return (
                    <div
                        key={`tab-btn-${idx}`}
                        className={classNames("tab-wrapper", { "active": idx === selectedTab })}
                    >
                        <button
                            className="tab"
                            type="button"
                            key={idx}
                            disabled={isDisabled}
                            onClick={() => setSelectedTab(idx)}
                        >
                            {tab}
                        </button>
                        {isLoading && (
                            <Spinner />
                        )}
                        {counter !== 0 && (
                            <div className="tab-counter">
                                {counter}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="tabbed-section">
            {tabsView}
            {children.map((child, idx) => (
                <div
                    key={`tab-${idx}`}
                    className={classNames("tab-content", { "active": idx === selectedTab })}
                >
                    {child}
                </div>
            ))}
        </div>
    );
};

TabbedSection.defaultProps = {
    tabOptions: undefined
};

export default TabbedSection;
