import React from "react";
import classNames from "classnames";
import "./ExplorerVersion.scss";

export default function ExplorerVersion({ shimmerTheme }: { shimmerTheme?: boolean }): React.JSX.Element {
    const explorerVersion = EXPLORER_VERSION ?? "";

    return (
        <>
            {explorerVersion && (
                <section className={classNames("explorer-version", { "shimmer-version": shimmerTheme })}>
                    <span>v{explorerVersion}</span>
                </section>
            )}
        </>
    );
}
