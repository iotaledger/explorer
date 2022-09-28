import { Converter } from "@iota/util.js-stardust";
import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { TextHelper } from "../../helpers/textHelper";
import "./DataToggle.scss";
import { DataToggleProps } from "./DataToggleProps";
import { DataToggleState } from "./DataToggleState";
import JsonViewer from "./JsonViewer";

interface DataToggleOption {
    /**
     * The label for the content.
     */
    label: string;

    /**
     * The content to be displayed.
     */
    content?: string;
}

/**
 * Component which will display a section with different contents able to be navigate through tabs.
 */
class DataToggle extends Component<DataToggleProps, DataToggleState> {
    /**
     * Create a new instance of DataToggle.
     * @param props The props.
     */
    constructor(props: DataToggleProps) {
        super(props);
        this.state = {
            activeTab: 0,
            hexView: this.props.sourceData
        };
    }

    public componentDidMount(): void {
        this.populateFormats();
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { link } = this.props;
        const { activeTab, hexView, utf8View, jsonView } = this.state;

        const options: DataToggleOption[] = [];
        if (jsonView) {
            options.push({ label: "JSON", content: jsonView });
        } else if (utf8View) {
            options.push({ label: "Text", content: utf8View });
        }
        options.push({ label: "HEX", content: hexView });

        const activeOption: DataToggleOption = options[activeTab];
        const activeContent = activeOption.content;

        const isJson = activeOption.label === "JSON";

        return (
            <div className="data-toggle">
                {link ?
                    <a className="data-toggle--content" href={link}>{activeContent}</a> :
                    (isJson ?
                        <div className="data-toggle--content"><JsonViewer json={activeContent} /></div> :
                        <div className="data-toggle--content">{activeContent}</div>)}
                <div className="data-toggle--tabs">
                    {options.map((option, index) => (
                        option.content ? (
                            <div
                                key={option.label}
                                className={classNames(
                                    "data-toggle--tab", { "data-toggle--tab__active": activeTab === index }
                                )}
                                onClick={() => this.setState({ activeTab: index })}
                            >
                                {option.label}
                            </div>) : null
                    ))}
                </div>
            </div>
        );
    }

    /**
     * Converts hex data to UTF-8 and Json, if possible.
     */
     private populateFormats() {
         let utf8View;
         let jsonView;
         let hexView = this.state.hexView;
         const checkValidUtf8 = true;

         const isSpacesBetweenBytes = this.props.withSpacedHex ?? false;

         if (!checkValidUtf8 || (checkValidUtf8 && TextHelper.isUTF8(Converter.hexToBytes(hexView)))) {
             utf8View = Converter.hexToUtf8(hexView);
         }

         if (isSpacesBetweenBytes) {
             const canBeSpacedMatch = hexView.match(/.{1,2}/g);
             hexView = canBeSpacedMatch ? canBeSpacedMatch.join(" ") : hexView;
         }

         try {
             if (utf8View) {
                 jsonView = JSON.stringify(JSON.parse(utf8View), undefined, "  ");
             }
         } catch { }

         this.setState({ hexView, utf8View, jsonView });
    }
}

export default DataToggle;
