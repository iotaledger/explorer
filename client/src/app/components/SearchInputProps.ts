import { ProtocolVersion } from "../../models/db/protocolVersion";

export interface SearchInputProps {
    /**
     * Show in compact mode.
     */
    compact: boolean;

    /**
     * Change behaviour based on protocol.
     */
    protocolVersion: ProtocolVersion;

    /**
     * Perform a search.
     * @param query The query to search for.
     */
    onSearch(query: string): void;
}
