/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import { IFoundryOutput, IMetadataFeature, METADATA_FEATURE_TYPE } from "@iota/iota.js-stardust";
import { Converter } from "@iota/util.js-stardust";
import { Validator as JsonSchemaValidator } from "jsonschema";
import React, { ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ITokenMetadata } from "../../../models/api/stardust/foundry/ITokenMetadata";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import Spinner from "../Spinner";
import tokenSchemeIRC30 from "./../../../assets/schemas/token-schema-IRC30.json";
import { AssetProps } from "./AssetProps";

/**
 * Component which will display an asset.
 */
const Asset: React.FC<AssetProps> = (
    { network, tableFormat, token }
) => {
    const [tokenMetadata, setTokenMetadata] = useState<ITokenMetadata | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );

    useEffect(() => {
        // eslint-disable-next-line no-void
        void loadTokenDetails(token.id);
    }, []);

    const loadTokenDetails = async (foundryId: string): Promise<void> => {
        if (!isLoading) {
            setIsLoading(true);
            // eslint-disable-next-line no-void
            void tangleCacheService.foundryDetails({ network, foundryId }).then(response => {
                if (!response.error) {
                    const immutableFeatures = (response.foundryDetails?.output as IFoundryOutput).immutableFeatures;

                    const metadata = immutableFeatures?.find(
                        feature => feature.type === METADATA_FEATURE_TYPE
                    ) as IMetadataFeature;

                    if (metadata) {
                        updateTokenInfo(metadata);
                    }
                }

                setIsLoading(false);
            }).catch(_ => {
                setIsLoading(false);
            });
        }
    };

    const updateTokenInfo = (metadata: IMetadataFeature): void => {
        const validator = new JsonSchemaValidator();

        try {
            const tokenInfo = JSON.parse(Converter.hexToUtf8(metadata.data)) as ITokenMetadata;
            const result = validator.validate(tokenInfo, tokenSchemeIRC30);

            if (result.valid) {
                setTokenMetadata(tokenInfo);
            }
        } catch { }
    };

    const shortId = `${token?.id.slice(0, 12)}...${token?.id.slice(-12)}`;

    const buildTokenName = (name: string, logoUrl?: string): string | ReactElement => {
        if (logoUrl) {
            return (
                <span className="token__name">
                    <img className="token__logo margin-r-5" src={logoUrl} alt={name} />
                    {name}
                </span>
            );
        }
        return name;
    };

    /**
     * Render the component.
     * @returns The node to render.
     */
    return (
        tableFormat ? (
            <tr>
                <td>
                    {isLoading ? (
                        <Spinner compact />
                    ) : (
                        tokenMetadata?.name ? buildTokenName(tokenMetadata.name, tokenMetadata.logoUrl) : "-"
                    )}
                </td>
                <td>
                    {isLoading ? (
                        <Spinner compact />
                    ) : (
                        tokenMetadata?.symbol ?? "-"
                    )}
                </td>
                <td className="highlight">
                    <Link
                        to={`/${network}/foundry/${token?.id}`}
                        className="margin-r-t"
                    >
                        {shortId}
                    </Link>
                </td>
                <td>{token.amount ?? "-"}</td>
            </tr>
        ) : (
            <div className="asset-card">
                <div className="field">
                    <div className="label">Name</div>
                    <div className="value">
                        {isLoading ? (
                            <Spinner compact />
                        ) : (
                            tokenMetadata?.name ? buildTokenName(tokenMetadata.name, tokenMetadata.logoUrl) : "-"
                        )}
                    </div>
                </div>
                <div className="field">
                    <div className="label">Symbol</div>
                    <div className="value">
                        {isLoading ? (
                            <Spinner compact />
                        ) : (
                            tokenMetadata?.symbol ?? "-"
                        )}
                    </div>
                </div>
                <div className="field">
                    <div className="label">Token id</div>
                    <div className="value highlight">
                        <Link
                            to={`/${network}/foundry/${token?.id}`}
                            className="margin-r-t"
                        >
                            {shortId}
                        </Link>
                    </div>
                </div>
                <div className="field">
                    <div className="label">Quantity</div>
                    <div className="value">{token.amount ?? "-"}</div>
                </div>
            </div>
        )
    );
};

export default Asset;

