import React from "react";
import { IIconContent } from "../lib/ui/interfaces";
import "./IconContent.scss";

export default function IconContent({ Icon, title, subtitle }: IIconContent): React.JSX.Element {
    return (
        <div className="icon-content">
            <div className="icon">
                <Icon />
            </div>
            <div className="text-content">
                <span className="title">{title}</span>
                <p className="subtitle">{subtitle}</p>
            </div>
        </div>
    );
}
