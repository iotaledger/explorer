import React from "react";
import IdentityStardustResolver from "../../../../identity/DIDResolver";
import { IDIDResolverResponse } from "~/models/api/IIdentityStardustResolveResponse";

interface DIDSectionProps {
    resolvedDID: IDIDResolverResponse | null;
    network: string;
}

const DIDSection: React.FC<DIDSectionProps> = ({ resolvedDID, network }) => {
    return (
        <div className="section">
            <div className="section--data">
                <IdentityStardustResolver resolvedDID={resolvedDID} network={network} />
            </div>
        </div>
    );
};

export default DIDSection;
