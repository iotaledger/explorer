import { SimpleTokenScheme, TokenScheme, TokenSchemeType } from "@iota/sdk-wasm-stardust/web";
import React from "react";
import { useTokenRegistryNativeTokenCheck } from "~helpers/stardust/hooks/useTokenRegistryNativeTokenCheck";
import { formatNumberWithCommas } from "~helpers/stardust/valueFormatHelper";
import { ITokenMetadata } from "~models/api/stardust/foundry/ITokenMetadata";
import "./TokenInfoSection.scss";

interface TokenInfoSectionProps {
    /**
     * The token id.
     */
    readonly tokenId: string;
    /**
     * The token scheme for the foundry.
     */
    readonly tokenScheme: TokenScheme;
    /**
     * The IRC standard metadata.
     */
    readonly tokenMetadata?: ITokenMetadata | null;
}

const TokenInfoSection: React.FC<TokenInfoSectionProps> = ({ tokenId, tokenScheme, tokenMetadata }) => {
    const [isWhitelisted] = useTokenRegistryNativeTokenCheck(tokenId);

    if (tokenScheme.type !== TokenSchemeType.Simple) {
        return null;
    }

    const simpleTokenScheme = tokenScheme as SimpleTokenScheme;

    const maximumSupply = formatNumberWithCommas(BigInt(simpleTokenScheme.maximumSupply));
    const mintedTokens = formatNumberWithCommas(BigInt(simpleTokenScheme.mintedTokens));
    const meltedTokens = formatNumberWithCommas(BigInt(simpleTokenScheme.meltedTokens));

    return (
        <div className="token-info">
            <div className="section no-border-bottom padding-b-0">
                {tokenMetadata && isWhitelisted && (
                    <div className="token-metadata">
                        <div className="section--data">
                            <div className="label">Name</div>
                            <div className="value code row middle">
                                {tokenMetadata.logoUrl && (
                                    <span className="margin-r-t">
                                        <img
                                            className="token-metadata__logo margin-r-5"
                                            src={tokenMetadata.logoUrl}
                                            alt={tokenMetadata.name}
                                        />
                                    </span>
                                )}
                                <span className="margin-r-t">{tokenMetadata.name}</span>
                                <span className="token-metadata__symbol margin-r-t">{tokenMetadata.symbol}</span>
                            </div>
                        </div>
                        {tokenMetadata.description && (
                            <div className="section--data">
                                <div className="label">Description</div>
                                <div className="value code row middle">
                                    <span className="margin-r-t">{tokenMetadata.description}</span>
                                </div>
                            </div>
                        )}
                        {tokenMetadata.logoUrl && (
                            <div className="section--data">
                                <div className="label">Resources</div>
                                <div className="value code row middle">
                                    <span className="margin-r-t">
                                        <a href={tokenMetadata.logoUrl} target="_blank" rel="noreferrer" className="rate--value">
                                            {tokenMetadata.logoUrl}
                                        </a>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <div className="section--data">
                    <div className="label">Token scheme</div>
                    <div className="value code row middle">
                        <span className="margin-r-t">{tokenScheme.type}</span>
                    </div>
                </div>
                <div className="section--data">
                    <div className="label">Maximum supply</div>
                    <div className="value code row middle">
                        <span className="margin-r-t">{maximumSupply}</span>
                    </div>
                </div>
                <div className="section--data">
                    <div className="label">Minted tokens</div>
                    <div className="value code row middle">
                        <span className="margin-r-t">{mintedTokens}</span>
                    </div>
                </div>
                <div className="section--data">
                    <div className="label">Melted tokens</div>
                    <div className="value code row middle">
                        <span className="margin-r-t">{meltedTokens}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
TokenInfoSection.defaultProps = {
    tokenMetadata: undefined,
};

export default TokenInfoSection;
