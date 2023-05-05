import React from "react";
import "./ShortID.scss";
import { Link } from "react-router-dom";

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

const linkByType = ({ network, id, linkType }: ShortIDProps): string => {
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

const ShortID: React.FC<ShortIDProps> = props => {
    const link = linkByType(props);

    const inner = (
        <React.Fragment>
            {props.id.slice(0, 30)}...
            {props.hasSlot ?
                <span>: {props.id.split(":")[1]}</span>
                : <span />} <span className="id-part">{props.id}</span>
        </React.Fragment>
    );

    const classes = [];
    if (props.marginTop) {
        classes.push("id-with-margin-top");
    }

    if (props.linkType === LinkType.None) {
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
