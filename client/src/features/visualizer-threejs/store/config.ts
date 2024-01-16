import { create } from "zustand";

interface ConfigState {
    dimensions: { width: number; height: number };
    setDimensions: (width: number, height: number) => void;

    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;

    isEdgeRenderingEnabled: boolean;
    setEdgeRenderingEnabled: (isEdgeRenderingEnabled: boolean) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
    /**
     * Canvas dimensions
     */
    dimensions: { width: 0, height: 0 },
    setDimensions: (width, height) => {
        set((state) => ({
            ...state,
            dimensions: { width, height },
        }));
    },

    /**
     * Is animation playing
     */
    isPlaying: false,
    setIsPlaying: (isPlaying) => {
        set((state) => ({
            ...state,
            isPlaying,
        }));
    },

    /**
     * Is edge rendering enabled
     */
    isEdgeRenderingEnabled: false,
    setEdgeRenderingEnabled: (isEdgeRenderingEnabled) => {
        set((state) => ({
            ...state,
            isEdgeRenderingEnabled,
        }));
    },
}));
