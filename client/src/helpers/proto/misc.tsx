/**
 *
 * @param pastMarkers
 */
import React from "react";


/**
 * @param pastMarkers The pastMarkers object.
 * @returns The nodes to render.
 */
export function pastMarkersToNodes(pastMarkers: Record<string, unknown>): React.ReactNode[] {
    const nodes = [];
    for (const [key] of Object.keys(pastMarkers ?? {}).entries()) {
       nodes.push(<div>{key} - {pastMarkers[key] as string}</div>);
    }
    return nodes;
}

const typeStr = "Type";
const payloadStr = "Payload";

/**
 * Cleans the given type name into a name without "Payload" or "Type"
 * and adds spaces between each capital letter.
 * @param s the string to clean
 * @returns the cleaned string
 */
export function cleanTypeName(s: string): string {
    let name = s.split(typeStr)[0];
    const payloadStrIndex = name.indexOf(payloadStr);
    if (payloadStrIndex === -1) {
        return name.replace(/([A-Z])/g, " $1").trim();
    }
    name = name.slice(0, payloadStrIndex) + name.slice(payloadStrIndex + payloadStr.length);
    return name.replace(/([A-Z])/g, " $1").trim();
}
