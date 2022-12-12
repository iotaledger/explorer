import React from "react";
import "./BalanceTable.scss";

interface BalancesProps {
    balances: Map<string, number>;
    asList?: boolean;
}

const Balances: React.FC<BalancesProps> = (
    { balances, asList }
) => {
    if (balances.size === 0) {
        return (<p>There is no balance available.</p>);
    }

    const balanceNodes: React.ReactNode[] = [];

    for (const [key, val] of balances.entries()) {
        if (asList) {
            balanceNodes.push(<div key={key}>{key} - {val}</div>);
        } else {
            balanceNodes.push(
                <div className="asset-item asset-asset" key={key}>
                    <div className="asset-item__content">
                        <span className="asset-item--label">Asset</span>
                        <span className="asset-item--value asset-id">
                            {key}
                        </span>
                    </div>
                    <div className="asset-item__content">
                        <span className="asset-item--label">Balance</span>
                        <span className="asset-item--value asset-balance">{val}</span>
                    </div>
                </div>
            );
        }
    }


    return (
        <React.Fragment>{balanceNodes}</React.Fragment>
    );
};

Balances.defaultProps = {
    asList: false
};

export default Balances;
