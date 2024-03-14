import React from "react";
import { INovaButton } from "~/app/lib/ui/interfaces";
import { NovaButtonVariant } from "~/app/lib/ui/enums";
import "./NovaButton.scss";

export default function NovaButton({
    children,
    variant = NovaButtonVariant.Primary,
    ...buttonProps
}: INovaButton & React.PropsWithChildren): React.JSX.Element {
    return (
        <button className={`nova-button nova-button--${variant}`} {...buttonProps}>
            {children}
        </button>
    );
}
