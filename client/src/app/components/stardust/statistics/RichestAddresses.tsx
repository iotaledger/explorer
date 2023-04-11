import React, { useContext } from "react";
import { formatAmount } from "../../../../helpers/stardust/valueFormatHelper";
import { IRichAddress } from "../../../../models/api/stardust/chronicle/IRichestAddressesResponse";
import NetworkContext from "../../../context/NetworkContext";
import TruncatedId from "../TruncatedId";
import "./RichestAddresses.scss";

interface IRichestAddressesProps {
    data: IRichAddress[] | null;
}

export const RichestAddresses: React.FC<IRichestAddressesProps> = ({ data }) => {
    const { tokenInfo, name: network } = useContext(NetworkContext);

    return (
        <div className="section richest-addr-section">
            <div className="section--header">
                <h2>Richest addresses</h2>
            </div>
            <ul className="column richest-addr__list">
                {data?.map((entry, idx) => (
                    <li key={`radd-${entry.address}`} className="row middle richest-addr__entry" >
                        <span className="entry__idx">{idx + 1}</span>
                        <div className="entry__address">
                            <TruncatedId
                                id={entry.address}
                                link={`/${network}/addr/${entry.address}`}
                                showCopyButton
                            />
                        </div>
                        <div className="entry__balance">
                            {formatAmount(
                                Number(entry.balance),
                                tokenInfo,
                                false
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

