import { ProtocolVersion } from "../../models/config/protocolVersion";

export interface SearchInputProps {
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
