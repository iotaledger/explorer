import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { AsyncProps } from "../../../helpers/promise/AsyncProps";
import PromiseMonitor from "../../../helpers/promise/promiseMonitor";
import { IBech32AddressDetails } from "../../../models/api/IBech32AddressDetails";
import { AssociationType, IAssociation } from "../../../models/api/stardust/IAssociationsResponse";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import Modal from "../Modal";
import associatedOuputsMessage from "./../../../assets/modals/stardust/address/associated-outputs.json";
import { AssociatedOutputTab, buildAssociatedOutputsTabs, outputTypeToAssociations } from "./AssociatedOutputsUtils";
import AssociationSection from "./AssociationSection";
import "./AssociatedOutputs.scss";

interface AssociatedOutputsTableProps {
    /**
     * The network in context.
     */
    network: string;
    /**
     * Address details
     */
    addressDetails: IBech32AddressDetails;
}

const AssociatedOutputsTable: React.FC<AssociatedOutputsTableProps & AsyncProps> = (
    { network, addressDetails, onAsyncStatusChange }
) => {
    const mounted = useRef(false);
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [currentTab, setCurrentTab] = useState<AssociatedOutputTab>("Basic");
    const [associations, setAssociations] = useState<IAssociation[]>([]);
    const [tabsToRender, setTabsToRender] = useState<AssociatedOutputTab[]>([]);

    const unmount = () => {
        mounted.current = false;
    };

    useEffect(() => {
        mounted.current = true;

        const loadAssociatedOutputIdsMonitor = new PromiseMonitor(status => {
            onAsyncStatusChange(status);
        });

        // eslint-disable-next-line no-void
        void loadAssociatedOutputIdsMonitor.enqueue(
            async () => tangleCacheService.associatedOutputs(network, addressDetails).then(response => {
                if (response?.associations && mounted.current) {
                    setAssociations(response.associations);
                }
            })
        );

        return unmount;
    }, [network, addressDetails]);

    useEffect(() => {
        const tabs = buildAssociatedOutputsTabs(associations);
        setTabsToRender(tabs);
        if (tabs.length > 0) {
            setCurrentTab(tabs[0]);
        }
    }, [associations]);

    const associationTypesToRender: AssociationType[] | undefined = outputTypeToAssociations.get(currentTab);

    return (
        associations.length === 0 ? null : (
            <div className="section associated-outputs">
                <div className="section--header">
                    <div className="row middle">
                        <h2 className="associated-heading">Associated Outputs</h2>
                        <Modal icon="info" data={associatedOuputsMessage} />
                    </div>
                    <div className="tabs-wrapper">
                        {tabsToRender.map((tab, idx) => (
                            <button
                                type="button"
                                key={idx}
                                className={classNames("tab", { "active": tab === currentTab })}
                                onClick={() => setCurrentTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                {associationTypesToRender?.map((associationType, idx) => {
                    const targetAssociation: IAssociation | undefined = associations.find(
                        association => association.type === associationType
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
        )
    );
};

export default AssociatedOutputsTable;
