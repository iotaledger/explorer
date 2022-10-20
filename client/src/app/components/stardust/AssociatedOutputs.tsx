import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IBech32AddressDetails } from "../../../models/api/IBech32AddressDetails";
import { AssociationType, IAssociation } from "../../../models/api/stardust/IAssociationsResponse";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import Modal from "../Modal";
import associatedOuputsMessage from "./../../../assets/modals/stardust/address/associated-outputs.json";
import { AssociatedOutputTab, outputTypeToAssociations } from "./AssociatedOutputsUtils";
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

export const TABS: AssociatedOutputTab[] = ["Basic", "NFT", "Alias", "Foundry"];

const AssociatedOutputsTable: React.FC<AssociatedOutputsTableProps> = (
    { network, addressDetails }
) => {
    const mounted = useRef(false);
    const [currentTab, setCurrentTab] = useState<AssociatedOutputTab>("Basic");
    const [associations, setAssociations] = useState<IAssociation[]>([]);

    const unmount = () => {
        mounted.current = false;
    };

    // First fetch associated output ids
    useEffect(() => {
        mounted.current = true;
        const loadAssociatedOutputs = async () => {
            const tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);
            const associatedOutputsResponse = await tangleCacheService.associatedOutputs(network, addressDetails);

            if (associatedOutputsResponse?.associations && mounted.current) {
                setAssociations(associatedOutputsResponse.associations);
            }
        };

        /* eslint-disable @typescript-eslint/no-floating-promises */
        loadAssociatedOutputs();
        return unmount;
    }, [network, addressDetails]);


    const associationTypesToRender: AssociationType[] | undefined = outputTypeToAssociations.get(currentTab);

    return (
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
                        outputIds={targetAssociation?.outputIds}
                    />
                );
            })}
        </div>
    );
};

export default AssociatedOutputsTable;

