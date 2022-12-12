import React from "react";
import "./ShortID.scss";
import { Link } from "react-router-dom";

export enum LinkType {
    None,
    Block,
    Transaction,
    Output,
    Epoch,
    Conflict
}

/**
 *
 * @param linkType
 * @param props
 */
function linkByType(props: ShortIDProps): string {
    switch (props.linkType) {
        case LinkType.Block: {
            return `/${props.network}/block/${props.id}`;
        }
        case LinkType.Transaction: {
            return `/${props.network}/transaction/${props.id}`;
        }
        case LinkType.Epoch: {
            return `/${props.network}/epoch/${props.id}`;
        }
        case LinkType.Output: {
            return `/${props.network}/output/${props.id}`;
        }
        case LinkType.Conflict: {
            return `/${props.network}/conflict/${props.id}`;
        }
        default: {
            return "";
        }
    }
}

interface ShortIDProps {
    network: string;
    id: string;
    linkType: LinkType;
    hasEpoch?: boolean;
    marginTop?: boolean;
}

const ShortID: React.FC<ShortIDProps> = props => {
    const link = linkByType(props);

    const inner = (
        <React.Fragment>
            {props.id.slice(0, 30)}...
            {props.hasEpoch ?
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
    hasEpoch: false,
    marginTop: false
};

export default ShortID;
