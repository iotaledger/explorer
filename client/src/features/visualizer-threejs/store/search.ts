import { create } from "zustand";

interface SearchState {
    searchQuery: string;
    matchingBlockIds: string[];
    setSearchQuery: (query: string) => void;
    setMatchingBlockIds: (ids: string[]) => void;
}

// Create the store
const useSearchStore = create<SearchState>((set) => ({
    searchQuery: '',
    matchingBlockIds: [],

    // Action to update the search query
    setSearchQuery: (query) => set({ searchQuery: query }),

    // Action to update the block IDs
    setMatchingBlockIds: (ids) => set({ matchingBlockIds: ids }),
}));

export default useSearchStore;
