import React, { Component, ReactNode } from "react";
import { JsonViewerProps } from "./JsonViewerProps";
import { JsonSyntaxHelper } from "../../helpers/jsonSyntaxHelper";
import "./JsonViewer.scss";

/**
 * Component which will display json formatted.
 */
class JsonViewer extends Component<JsonViewerProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div
                className="json-viewer"
                dangerouslySetInnerHTML={{
                    __html:
                        this.props.json === undefined ? "undefined" : JsonSyntaxHelper.syntaxHighlight(this.props.json)
                }}
            />
        );
    }
}

export default JsonViewer;
