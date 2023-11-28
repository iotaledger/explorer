import React from "react";
import IdentityStardustResolver from "../../../../identity/IdentityStardustResolverNew";

interface DIDSectionProps {
    /**
     * The Alias Output
     */
    readonly output: string | null;
    readonly network: string | null;
}

const DIDSection: React.FC<DIDSectionProps> = ({ output, network }) => {
    const did = output ? `did:iota:tst:${output}` : undefined;
    return (
        <div className="section">
            <div className="section--data">
                <IdentityStardustResolver
                    did={did} network={network ?? "custom"}
                />
            </div>
        </div>
    );
};

export default DIDSection;

