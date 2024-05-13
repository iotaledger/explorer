/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import { FoundryOutput, MetadataFeature, FeatureType } from "@iota/sdk-wasm-stardust/web";
import { Validator as JsonSchemaValidator } from "jsonschema";
import React, { ReactElement, useEffect, useState } from "react";
import { AssetProps } from "./AssetProps";
import tokenSchemeIRC30 from "~assets/schemas/token-schema-IRC30.json";
import { useFoundryDetails } from "~helpers/stardust/hooks/useFoundryDetails";
import { useTokenRegistryNativeTokenCheck } from "~helpers/stardust/hooks/useTokenRegistryNativeTokenCheck";
import { Converter } from "~helpers/stardust/convertUtils";
import { ITokenMetadata } from "~models/api/stardust/foundry/ITokenMetadata";
import Spinner from "../../../../Spinner";
import TruncatedId from "../../../TruncatedId";

/**
 * Component which will display an asset.
 */
const Asset: React.FC<AssetProps> = ({ network, tableFormat, token }) => {
    const [foundryDetails, isLoading] = useFoundryDetails(network, token.id);
    const [tokenMetadata, setTokenMetadata] = useState<ITokenMetadata | null>(null);
    const [isWhitelisted] = useTokenRegistryNativeTokenCheck(token.id);

    useEffect(() => {
        if (isWhitelisted && foundryDetails) {
            const immutableFeatures = (foundryDetails?.output as FoundryOutput).immutableFeatures;

            const metadata = immutableFeatures?.find((feature) => feature.type === FeatureType.Metadata) as MetadataFeature;

            if (metadata) {
                updateTokenInfo(metadata);
            }
        }
    }, [isWhitelisted, foundryDetails]);

    const updateTokenInfo = (metadata: MetadataFeature): void => {
        const validator = new JsonSchemaValidator();

        try {
            const tokenInfo = JSON.parse(Converter.hexToUtf8(metadata.data)) as ITokenMetadata;
            const result = validator.validate(tokenInfo, tokenSchemeIRC30);

            if (result.valid) {
                setTokenMetadata(tokenInfo);
            }
        } catch {}
    };

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
    return tableFormat ? (
        <tr>
            <td className="truncate">
                {isLoading ? <Spinner compact /> : tokenMetadata?.name ? buildTokenName(tokenMetadata.name, tokenMetadata.logoUrl) : "-"}
            </td>
            <td>{isLoading ? <Spinner compact /> : tokenMetadata?.symbol ?? "-"}</td>
            <td className="highlight">
                <TruncatedId id={token?.id} link={`/${network}/foundry/${token?.id}`} />
            </td>
            <td>{token.amount.toString() ?? "-"}</td>
        </tr>
    ) : (
        <div className="asset-card">
            <div className="field">
                <div className="label">Name</div>
                <div className="value truncate">
                    {isLoading ? (
                        <Spinner compact />
                    ) : tokenMetadata?.name ? (
                        buildTokenName(tokenMetadata.name, tokenMetadata.logoUrl)
                    ) : (
                        "-"
                    )}
                </div>
            </div>
            <div className="field">
                <div className="label">Symbol</div>
                <div className="value">{isLoading ? <Spinner compact /> : tokenMetadata?.symbol ?? "-"}</div>
            </div>
            <div className="field">
                <div className="label">Token id</div>
                <div className="value">
                    <TruncatedId id={token?.id} link={`/${network}/foundry/${token?.id}`} />
                </div>
            </div>
            <div className="field">
                <div className="label">Quantity</div>
                <div className="value">{token.amount.toString() ?? "-"}</div>
            </div>
        </div>
    );
};

export default Asset;
