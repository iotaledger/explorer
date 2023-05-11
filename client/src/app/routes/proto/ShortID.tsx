import React from "react";
import { Link } from "react-router-dom";
import "./ShortID.scss";

export enum LinkType {
    None,
    Block,
    Transaction,
    Output,
    Slot,
    Conflict
}

interface ShortIDProps {
    network: string;
    id: string;
    linkType: LinkType;
    hasSlot?: boolean;
    marginTop?: boolean;
}

const linkByType = (id: string, network: string, linkType: LinkType) => {
    switch (linkType) {
        case LinkType.Block: {
            return `/${network}/block/${id}`;
        }
        case LinkType.Transaction: {
            return `/${network}/transaction/${id}`;
        }
        case LinkType.Slot: {
            return `/${network}/slot/${id}`;
        }
        case LinkType.Output: {
            return `/${network}/output/${id}`;
        }
        case LinkType.Conflict: {
            return `/${network}/conflict/${id}`;
        }
        default: {
            return "";
        }
    }
};

const ShortID: React.FC<ShortIDProps> = ({ id, network, linkType, hasSlot, marginTop }) => {
    const link = linkByType(id, network, linkType);

    const inner = (
        <React.Fragment>
            {id.slice(0, 30)}...
            {hasSlot ?
                <span>: {id.split(":")[1]}</span>
                : <span />} <span className="id-part">{id}</span>
        </React.Fragment>
    );

    const classes = [];
    if (marginTop) {
        classes.push("id-with-margin-top");
    }

    if (linkType === LinkType.None) {
        return (<div className={classes.join(" ")}>{inner}</div>);
    }

    return (
        <div className={classes.join(" ")}>
            <Link className="pointer" to={link}>
                {inner}
            </Link>
        </div>
    );
};

ShortID.defaultProps = {
    hasSlot: false,
    marginTop: false
};

export default ShortID;
