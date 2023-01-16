/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import React, { ReactElement } from "react";
import { Link } from "react-router-dom";
import Spinner from "../Spinner";
import { AssetProps } from "./AssetProps";

/**
 * Component which will display an asset.
 */
const Asset: React.FC<AssetProps> = (
    { network, tableFormat, isLoading, token }
) => {
    const shortId = `${token?.id.slice(0, 6)}...${token?.id.slice(-6)}`;

    const getTokenName = (name: string, logoUrl?: string): string | ReactElement => {
        if (logoUrl) {
            return (
                <span className="token__name">
                    <img className="token__logo margin-r-5" src={token.logoUrl} alt={token.name} />
                    {token.name}
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
                    {isLoading && !token.name ?
                        <Spinner compact /> :
                        (token.name ?
                            getTokenName(token.name, token.logoUrl) :
                            "-")}
                </td>
                <td>
                    {isLoading && !token.symbol ?
                        <Spinner compact /> :
                        (token.symbol ?? "-")}
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
                <td>{token.price ?? "-"}</td>
                <td>{token.value ?? "-"}</td>
            </tr>
        ) : (
            <div className="asset-card">
                <div className="field">
                    <div className="label">Name</div>
                    <div className="value">
                        {isLoading && !token.name ?
                            <Spinner compact /> :
                            (token.name ?
                                getTokenName(token.name, token.logoUrl) :
                                "-")}
                    </div>
                </div>
                <div className="field">
                    <div className="label">Symbol</div>
                    <div className="value">
                        {isLoading && !token.symbol ?
                            <Spinner compact /> :
                            (token.symbol ?? "-")}
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
                <div className="field">
                    <div className="label">Price</div>
                    <div className="value">{token.price ?? "-"}</div>
                </div>
                <div className="field">
                    <div className="label">Value</div>
                    <div className="value">{token.value ?? "-"}
                    </div>
                </div>
            </div >
        )
    );
};

export default Asset;

