import React, { Component, ReactNode } from "react";
import "./JsonViewer.scss";
import { JsonViewerProps } from "./JsonViewerProps";

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
                dangerouslySetInnerHTML={
                    { __html: this.props.json === undefined ? "undefined" : this.syntaxHighlight(this.props.json) }
                }
            />
        );
    }

    /**
     * Highlight the json.
     * @param json The json to highlight.
     * @returns The highlighted json.
     */
    private syntaxHighlight(json: string): string {
        return json
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            // eslint-disable-next-line max-len
            .replace(/("(\\u[\dA-Za-z]{4}|\\[^u]|[^"\\])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[Ee][+-]?\d+)?)/g,
                match => {
                    let cls = "number";
                    if (match.startsWith("\"")) {
                        cls = match.endsWith(":") ? "key" : "string";
                    } else if (/true|false/.test(match)) {
                        cls = "boolean";
                    } else if (match.includes("null")) {
                        cls = "null";
                    }
                    return `<span class="${cls}">${match}</span>`;
                });
    }
}

export default JsonViewer;
