import React, { Key } from "react";
import { Link } from "react-router-dom";
import { IFoundationData } from "../models/IFoundationData";

/**
 * Class to help with foundation data.
 */
export class FoundationDataHelper {
    /**
     * The location of the foundation data.
     */
    public static FOUNDATION_DATA_URL: string = "https://webassets.iota.org/data/foundation.json";

    /**
     * Cached version of the data.
     */
    private static _foundationData: IFoundationData;

    /**
     * Load the found data.
     * @returns The loaded foundation data.
     */
    public static async loadData(): Promise<IFoundationData | undefined> {
        if (!FoundationDataHelper._foundationData) {
            try {
                const foundationDataResponse = await fetch(FoundationDataHelper.FOUNDATION_DATA_URL);
                FoundationDataHelper._foundationData = await foundationDataResponse.json();
            } catch {
                console.error(`Failed loading foundation data from ${FoundationDataHelper.FOUNDATION_DATA_URL}`);
            }
        }

        return FoundationDataHelper._foundationData;
    }

    /**
     * Create the display for a value.
     * @param info The information to display.
     * @param info.label Label for the info.
     * @param info.value The value to show.
     * @param info.urls The url to link to.
     * @param key The key of the item.
     * @returns The element to display.
     */
    public static createValue(
        info: {
            /**
             * The label for the information.
             */
            label: string;

            /**
             * The optional value for the information.
             */
            value?: string;

            /**
             * The optional urls.
             */
            urls?: {
                /**
                 * The label for the link.
                 */
                label: string;
                /**
                 * The url to link to.
                 */
                url: string;
            }[];
        },
        key?: Key): React.ReactNode {
        return (
            <React.Fragment key={key}>
                {info.label && (
                    <span
                        className="data-label"
                        dangerouslySetInnerHTML={
                            { __html: FoundationDataHelper.buildLines(info.label) }
                        }
                    />
                )}
                {info.value && (
                    <span
                        className="data-value"
                        dangerouslySetInnerHTML={
                            { __html: FoundationDataHelper.buildLines(info.value) }
                        }
                    />
                )}
                {info.urls?.map((link, idx) => (
                    <React.Fragment key={idx}>
                        {FoundationDataHelper.buildLink(link.url, link.label)}
                        {info.urls && idx < info.urls.length - 1 && ", "}
                    </React.Fragment>
                ))}
            </React.Fragment>
        );
    }

    /**
     * Build lines to display.
     * @param content The content to display.
     * @returns The element to display.
     */
    public static buildLines(content: string | string[]): string {
        if (Array.isArray(content)) {
            return `<span className="line-breaks">${content.join("\n")}</span>`;
        }

        return content;
    }

    /**
     * Build link as either local or external.
     * @param url The url to create.
     * @param value The label for the link.
     * @param key The key of the item.
     * @returns The created link element.
     */
    public static buildLink(url: string, value: string | string[], key?: Key): React.ReactNode {
        if (url.startsWith("http") || url.startsWith("mailto")) {
            return (
                <a
                    className="data-link"
                    href={url}
                    key={key}
                    target="_blank"
                    rel="noopener noreferrer"
                    dangerouslySetInnerHTML={
                        { __html: FoundationDataHelper.buildLines(value) }
                    }
                />
            );
        }

        return (
            <Link
                className="data-link"
                key={key}
                to={url.replace("local:/", "")}
                dangerouslySetInnerHTML={
                    { __html: FoundationDataHelper.buildLines(value) }
                }
            />
        );
    }
}
