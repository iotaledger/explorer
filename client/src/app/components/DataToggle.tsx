import { HexEncodedString } from "@iota/sdk-wasm-stardust/web";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import CopyButton from "./CopyButton";
import { DataToggleProps } from "./DataToggleProps";
import JsonViewer from "./JsonViewer";
import { Converter } from "~helpers/stardust/convertUtils";
import { deserializeParticipationEventMetadata } from "~helpers/stardust/participationUtils";
import { ReadStream } from "~helpers/stardust/readStreamUtils";
import { TextHelper } from "~helpers/textHelper";
import "./DataToggle.scss";

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

const DataToggle: React.FC<DataToggleProps> = ({ sourceData, link, withSpacedHex, isParticipationEventMetadata }) => {
    const [options, setOptions] = useState<DataToggleOption[]>([]);
    const [isJson, setIsJson] = useState<boolean>(false);
    const [activeOption, setActiveOption] = useState<DataToggleOption>();
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
            } catch {}
        }
        if (isParticipationEventMetadata) {
            const readStream = new ReadStream(Converter.hexToBytes(sourceData));
            const participations = deserializeParticipationEventMetadata(readStream);
            try {
                jsonView = JSON.stringify(participations, undefined, "  ");
            } catch {}
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
        const option = options[activeTab];
        if (option) {
            setIsJson(option.label === "JSON");
            setActiveOption(option);
        }
    }, [activeTab, options]);

    const content = activeOption?.content;
    return (
        <div className="data-toggle">
            {link ? (
                <a className="data-toggle--content" href={link}>
                    {content}
                </a>
            ) : isJson ? (
                <div className="data-toggle--content">
                    <JsonViewer json={content} />
                </div>
            ) : (
                <div className="data-toggle--content">{content}</div>
            )}
            <div className="data-toggle--tabs">
                {options.map((option, index) =>
                    option.content ? (
                        <div
                            key={option.label}
                            className={classNames("data-toggle--tab", { "data-toggle--tab__active": activeTab === index })}
                            onClick={() => setActiveTab(index)}
                        >
                            {option.label}
                        </div>
                    ) : null,
                )}
                <div className="data-toggle--tab margin-t-2">
                    <CopyButton copy={content && activeOption?.label === "HEX" ? content.replaceAll(/\s+/g, "") : content} />
                </div>
            </div>
        </div>
    );
};

export default DataToggle;
