import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { AssociatedOutputTab, buildAssociatedOutputsTabs, outputTypeToAssociations } from "./AssociatedOutputsUtils";
import AssociationSection from "./AssociationSection";
import { useAssociatedOutputs } from "~helpers/stardust/hooks/useAssociatedOutputs";
import { IBech32AddressDetails } from "~models/api/IBech32AddressDetails";
import { AssociationType, IAssociation } from "~models/api/stardust/IAssociationsResponse";
import "./AssociatedOutputs.scss";

interface AssociatedOutputsProps {
    /**
     * The network in context.
     */
    readonly network: string;
    /**
     * Address details
     */
    readonly addressDetails: IBech32AddressDetails;
    /**
     * Callback setter to report the associated outputs count.
     */
    readonly setOutputCount?: (count: number) => void;
    /**
     * Callback setter to report if the component is loading outputs.
     */
    readonly setIsLoading?: (isLoading: boolean) => void;
}

const AssociatedOutputs: React.FC<AssociatedOutputsProps> = ({ network, addressDetails, setOutputCount, setIsLoading }) => {
    const [currentTab, setCurrentTab] = useState<AssociatedOutputTab>("Basic");
    const [associations, isLoading] = useAssociatedOutputs(network, addressDetails, setOutputCount);
    const [tabsToRender, setTabsToRender] = useState<AssociatedOutputTab[]>([]);

    useEffect(() => {
        if (setIsLoading) {
            setIsLoading(isLoading);
        }
    }, [isLoading]);

    useEffect(() => {
        const tabs = buildAssociatedOutputsTabs(associations);
        setTabsToRender(tabs);
        if (tabs.length > 0) {
            setCurrentTab(tabs[0]);
        }
    }, [associations]);

    const associationTypesToRender: AssociationType[] | undefined = outputTypeToAssociations.get(currentTab);

    return associations.length === 0 ? null : (
        <div className="section associated-outputs">
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
            {associationTypesToRender?.map((associationType, idx) => {
                const targetAssociation: IAssociation | undefined = associations.find(
                    (association) => association.type === associationType,
                );
                return (
                    <AssociationSection
                        key={`${currentTab}-${idx}`}
                        association={associationType}
                        outputIds={targetAssociation?.outputIds}
                    />
                );
            })}
        </div>
    );
};

AssociatedOutputs.defaultProps = {
    setIsLoading: undefined,
    setOutputCount: undefined,
};

export default AssociatedOutputs;
