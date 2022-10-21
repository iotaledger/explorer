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
import { AssociatedOutputTab, outputTypeToAssociations } from "./AssociatedOutputsUtils";
import AssociationSection from "./AssociationSection";
import "./AssociatedOutputs.scss";
import { ED25519_ADDRESS_TYPE } from "@iota/iota.js-stardust";

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

export const TABS: AssociatedOutputTab[] = ["Basic", "NFT", "Alias", "Foundry"];

const AssociatedOutputsTable: React.FC<AssociatedOutputsTableProps & AsyncProps> = (
    { network, addressDetails, onAsyncStatusChange }
) => {
    const mounted = useRef(false);
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [currentTab, setCurrentTab] = useState<AssociatedOutputTab>("Basic");
    const [associations, setAssociations] = useState<IAssociation[]>([]);

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

        if (addressDetails.type === ED25519_ADDRESS_TYPE) {
            const index = TABS.indexOf("Foundry");
            TABS.splice(index, 1);
        }

        return unmount;
    }, [network, addressDetails]);

    const associationTypesToRender: AssociationType[] | undefined = outputTypeToAssociations.get(currentTab);

    return (
        associations.length === 0 ? null : (
            <div className="section">
                <div className="section--header">
                    <div className="row middle">
                        <h2>Associated Outputs</h2>
                        <Modal icon="info" data={associatedOuputsMessage} />
                    </div>
                    <div className="tabs-wrapper">
                        {TABS.map((tab, idx) => (
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
                            key={idx}
                            association={associationType}
                            outputIds={targetAssociation?.outputIds.reverse()}
                        />
                    );
                })}
            </div>
        )
    );
};

export default AssociatedOutputsTable;

