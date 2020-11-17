import { INetwork } from "../models/db/INetwork";

/**
 * Class for helping to build routes.
 */
export class RouteBuilder {
    /**
     * Build the link for a milestone.
     * @param networkConfig The network configuration.
     * @param item The item details.
     * @param item.id The item for the item.
     * @param item.milestoneIndex The milestone index for the item.
     * @returns The milestone route.
     */
    public static buildMilestone(networkConfig: INetwork | undefined, item: {
        /**
         * The id.
         */
        id: string;
        /**
         * The milestone index.
         */
        milestoneIndex: number;
    }): string {
        const parts = [];
        if (networkConfig) {
            parts.push(networkConfig.network);
        }
        if (networkConfig?.protocolVersion === "og") {
            parts.push("transaction");
            parts.push(item.id);
        } else {
            parts.push("milestone");
            parts.push(item.milestoneIndex);
        }
        return `/${parts.join("/")}`;
    }

    /**
     * Build the link for an item.
     * @param networkConfig The network configuration.
     * @param id The item details.
     * @returns The item route.
     */
    public static buildItem(networkConfig: INetwork | undefined, id: string): string {
        const parts = [];
        if (networkConfig) {
            parts.push(networkConfig.network);
        }
        if (networkConfig?.protocolVersion === "og") {
            parts.push("transaction");
            parts.push(id);
        } else {
            parts.push("message");
            parts.push(id);
        }
        return `/${parts.join("/")}`;
    }
}
