/**
 * The request for Tagged Output Ids on stardust.
 */
export interface ITaggedOutputsRequest {
    /**
     * The network in context.
     */
    network: string;

    /**
     * The tag query.
     */
    tag: string;

    /**
     * The output type to be searched.
     */
    outputType: "basic" | "nft";

    /**
     * The cursor state for pagination.
     */
    cursor?: string;
}
