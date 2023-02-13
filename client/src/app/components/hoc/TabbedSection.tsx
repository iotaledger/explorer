import classNames from "classnames";
import React, { useState } from "react";
import Modal from "../Modal";
import { ModalData } from "../ModalProps";
import Spinner from "../Spinner";
import "./TabbedSection.scss";

interface TabOption {
    /**
     * Is the Tab disabled (it will make the tab unclickable).
     */
    disabled?: boolean;
    /**
     * An optional "counter" from this section domain that can be displayed on the tab.
     */
    counter?: number;
    /**
     * Is the Tab data loading (it will render a loading spinner on the tab).
     */
    isLoading?: boolean;
    /**
     * Content for info icon modal that will be rendered on the tab.
     */
    infoContent?: ModalData;
}

interface TabOptions {
    /**
     * Each key must match one tab "key" from the 'tabsEnum' array.
     */
    [tabName: string]: TabOption;
}

interface TabbedSectionProps {
    /**
     * An object with properties being the tabs to render (values are the tab labels).
     */
    tabsEnum: Record<string, string>;
    /**
     * The components the render for each selected tab. Must have the same size and ordering as the
     * corresponding 'tabsEnum' prop.
     */
    children: React.ReactElement[];
    /**
     * Optional additional configuration for each tab.
     */
    tabOptions?: TabOptions;
}

// eslint-disable-next-line jsdoc/require-param
/**
 * Generic component to render a TabbedSection (Sections passed in are split into tabs).
 *
 * WARNING: The tabs array passed into the 'tabsEnum' prop MUST have the same cardinality and the same ordering,
 * as the React components passed into the children prop (wrapped by the TabbedSection component),
 * for this to work properly.
 * @returns The React component TSX.
 */
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

                const infoContent = tabOptions ?
                    (tabOptions[tab]?.infoContent !== undefined ? tabOptions[tab].infoContent : undefined)
                    : undefined;

                return (
                    <div
                        key={`tab-btn-${idx}`}
                        className={classNames("tab-wrapper",
                            { "active": idx === selectedTab },
                            { "disabled": isDisabled })}
                        onClick={() => {
                            if (!isDisabled) {
                                setSelectedTab(idx);
                            }
                        }}
                    >
                        <button
                            className="tab"
                            type="button"
                            key={idx}
                            disabled={isDisabled}
                        >
                            {tab}
                        </button>
                        {infoContent && (
                            <Modal icon="info" data={infoContent} />
                        )}
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

