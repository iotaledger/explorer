import { HexEncodedString } from "@iota/iota.js-stardust";
import { Converter } from "@iota/util.js-stardust";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { TextHelper } from "../../helpers/textHelper";
import "./DataToggle.scss";
import { DataToggleProps } from "./DataToggleProps";
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

const DataToggle: React.FC<DataToggleProps> = (
    { sourceData, link, withSpacedHex }
) => {
    const [options, setOptions] = useState<DataToggleOption[]>([]);
    const [isJson, setIsJson] = useState<boolean>(false);
    const [activeContent, setActiveContent] = useState<string>();
    const [activeTab, setActiveTab] = useState<number>(0);

    useEffect(() => {
        let utf8View: string | undefined;
        let jsonView: string | undefined;
        let hexView: HexEncodedString | undefined;
        const dtOptions: DataToggleOption[] = [];
        const hasSpacesBetweenBytes = withSpacedHex ?? false;

        if (TextHelper.isUTF8(Converter.hexToBytes(sourceData))) {
            utf8View = Converter.hexToUtf8(sourceData);
            try {
                jsonView = JSON.stringify(JSON.parse(utf8View), undefined, "  ");
            } catch { }
        }

        if (hasSpacesBetweenBytes) {
            const canBeSpacedMatch = sourceData.match(/.{1,2}/g);
            hexView = canBeSpacedMatch ? canBeSpacedMatch.join(" ") : sourceData;
        }

        if (jsonView) {
            dtOptions.push({ label: "JSON", content: jsonView });
        } else if (utf8View) {
            dtOptions.push({ label: "Text", content: utf8View });
        }
        dtOptions.push({ label: "HEX", content: hexView });
        setOptions(dtOptions);
    }, [sourceData]);

    useEffect(() => {
        const activeOption = options[activeTab];
        setIsJson(activeOption.label === "JSON");
        setActiveContent(activeOption.content);
    }, [activeTab]);

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
                            onClick={() => setActiveTab(index)}
                        >
                            {option.label}
                        </div>) : null
                ))}
            </div>
        </div>
    );
};

export default DataToggle;
