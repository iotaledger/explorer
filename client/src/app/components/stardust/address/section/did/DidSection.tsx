import React from "react";
import IdentityStardustResolver from "../../../../identity/IdentityStardustResolver";
import { IIdentityStardustResolveResponse } from "~/models/api/IIdentityStardustResolveResponse";

interface DIDSectionProps {
    resolvedDID: IIdentityStardustResolveResponse | null,
    network: string,
}

const DIDSection: React.FC<DIDSectionProps> = ({ resolvedDID, network }) => {
    return (
        <div className="section">
            <div className="section--data">
                <IdentityStardustResolver
                    resolvedDID={resolvedDID}
                    network={network}
                />
            </div>
        </div>
    );
};

export default DIDSection;

